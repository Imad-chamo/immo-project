import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notifyOrderConfirmed } from "@/lib/notifications";
import Stripe from "stripe";


export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { orderId, type, inspectorId, plan } = session.metadata || {};

    if (type === "subscription" && inspectorId && plan) {
      // Inspector subscription payment
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await prisma.subscription.create({
        data: {
          inspectorId: await getProfileId(inspectorId),
          plan: plan as "STARTER" | "PRO" | "EXPERT",
          price: session.amount_total! / 100,
          startDate: new Date(),
          endDate,
          status: "ACTIVE",
          paymentMethod: "CARD",
          stripeSessionId: session.id,
          confirmedByAdmin: true,
        },
      });

      const badge = plan === "EXPERT" ? "EXPERT" : plan === "PRO" ? "PRO" : "STARTER";
      await prisma.inspectorProfile.update({
        where: { userId: inspectorId },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionEnd: endDate,
          badge,
        },
      });
    } else if (orderId) {
      // Order payment
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "CONFIRMED",
          paymentConfirmedByAdmin: true,
        },
      });
      await notifyOrderConfirmed(orderId);
    }
  }

  return NextResponse.json({ received: true });
}

async function getProfileId(userId: string): Promise<string> {
  const profile = await prisma.inspectorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile!.id;
}
