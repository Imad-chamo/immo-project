import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscriptionCheckout } from "@/lib/stripe";
import { getSubscriptionPrice } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "INSPECTOR") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { plan, paymentMethod } = await req.json();
  const price = getSubscriptionPrice(plan);

  if (paymentMethod === "CARD") {
    const stripeSession = await createSubscriptionCheckout({
      inspectorId: session.user.id,
      plan,
      price,
      customerEmail: session.user.email!,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inspector?subscribed=card`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inspector/subscription`,
    });
    return NextResponse.json({ stripeUrl: stripeSession.url });
  }

  // Manual payment — create pending subscription
  const profile = await prisma.inspectorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  await prisma.subscription.create({
    data: {
      inspectorId: profile.id,
      plan: plan as "STARTER" | "PRO" | "EXPERT",
      price,
      startDate: new Date(),
      endDate,
      status: "ACTIVE",
      paymentMethod: paymentMethod as "WIRE" | "WAFACASH",
      confirmedByAdmin: false,
    },
  });

  return NextResponse.json({ success: true, manual: true });
}
