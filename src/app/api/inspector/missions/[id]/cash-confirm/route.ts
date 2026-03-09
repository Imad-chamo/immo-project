import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "INSPECTOR") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { amount } = await req.json();

  const order = await prisma.order.findFirst({
    where: { id, inspectorId: session.user.id },
  });

  if (!order) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });

  // Log the confirmation
  await prisma.cashConfirmationLog.create({
    data: {
      orderId: id,
      actor: session.user.id,
      actorRole: "INSPECTOR",
      amount,
      event: "INSPECTOR_CONFIRMED_RECEIPT",
    },
  });

  // Check for mismatch with client's amount
  const clientAmount = order.cashAmountByClient;
  const mismatch = clientAmount !== null && Math.abs(clientAmount - amount) > 5;

  await prisma.order.update({
    where: { id },
    data: {
      cashAmountByInspector: amount,
      paymentConfirmedByInspector: true,
      cashMismatch: mismatch,
    },
  });

  // If match, notify admin
  if (!mismatch && order.cashAmountByClient) {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (adminUser) {
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          type: mismatch ? "CASH_MISMATCH" : "CASH_CONFIRMED",
          title: mismatch ? "⚠ Incohérence cash" : "✅ Paiement cash confirmé",
          message: mismatch
            ? `Commande IVM-${id.slice(-8).toUpperCase()}: Client ${order.cashAmountByClient} MAD vs Inspecteur ${amount} MAD`
            : `Les deux parties confirment ${amount} MAD pour la commande IVM-${id.slice(-8).toUpperCase()}.`,
          metadata: { orderId: id, mismatch },
        },
      });
    }
  }

  return NextResponse.json({ success: true, mismatch });
}
