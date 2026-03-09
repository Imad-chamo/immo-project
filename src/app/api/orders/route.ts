import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { notifyAdminNewOrder } from "@/lib/notifications";
import { getFormulaPrice, getFormulaInspectorShare } from "@/lib/utils";
import { z } from "zod";

const orderSchema = z.object({
  formula: z.enum(["ESSENTIEL", "STANDARD", "PREMIUM"]),
  propertyAddress: z.string().min(5),
  propertyCity: z.string().min(2),
  propertyType: z.string().min(2),
  surfaceArea: z.number().optional().nullable(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["CARD", "WAFACASH", "WIRE", "WESTERN_UNION"]),
});

// GET: list orders for the current user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  let where = {};
  if (session.user.role === "CLIENT") where = { clientId: session.user.id };
  else if (session.user.role === "INSPECTOR") where = { inspectorId: session.user.id };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        client: { select: { name: true, email: true, phone: true } },
        inspector: { select: { name: true, image: true } },
        report: { select: { status: true, pdfUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

// POST: create a new order
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = orderSchema.parse(body);

    const clientPrice = getFormulaPrice(data.formula);
    const inspectorShare = getFormulaInspectorShare(data.formula);
    const margin = clientPrice - inspectorShare;

    // Check for referral credit
    const credits = await prisma.referralCredit.findMany({
      where: { userId: session.user.id, usedOnOrderId: null },
    });
    const creditApplied = credits.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0);
    const finalPrice = Math.max(clientPrice - creditApplied, 0);

    const order = await prisma.order.create({
      data: {
        clientId: session.user.id,
        formula: data.formula,
        propertyAddress: data.propertyAddress,
        propertyCity: data.propertyCity,
        propertyType: data.propertyType,
        surfaceArea: data.surfaceArea,
        notes: data.notes,
        clientPrice,
        inspectorShare,
        margin,
        creditApplied,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "CARD" ? "PENDING" : "PENDING",
      },
    });

    // Mark credits as used
    if (creditApplied > 0) {
      await prisma.referralCredit.updateMany({
        where: { userId: session.user.id, usedOnOrderId: null },
        data: { usedOnOrderId: order.id },
      });
    }

    // Notify admin
    await notifyAdminNewOrder(order.id);

    // Handle Stripe checkout
    if (data.paymentMethod === "CARD") {
      const stripeSession = await createCheckoutSession({
        orderId: order.id,
        formula: data.formula,
        clientPrice,
        creditApplied,
        customerEmail: session.user.email!,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/commander/success?orderId=${order.id}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/commander`,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: stripeSession.id },
      });

      return NextResponse.json({ orderId: order.id, stripeUrl: stripeSession.url });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
