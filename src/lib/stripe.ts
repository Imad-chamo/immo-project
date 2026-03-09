import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as const,
  typescript: true,
});

export async function createCheckoutSession({
  orderId,
  formula,
  clientPrice,
  creditApplied,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  orderId: string;
  formula: string;
  clientPrice: number;
  creditApplied: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const finalAmount = Math.max(clientPrice - creditApplied, 0);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "mad",
          product_data: {
            name: `Inspection Immobilière - ${formula}`,
            description: `Immo Verify Maroc - Commande #${orderId.slice(-8).toUpperCase()}`,
          },
          unit_amount: Math.round(finalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
      formula,
      creditApplied: creditApplied.toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function createSubscriptionCheckout({
  inspectorId,
  plan,
  price,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  inspectorId: string;
  plan: string;
  price: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "mad",
          product_data: {
            name: `Abonnement Inspecteur - ${plan}`,
            description: `Immo Verify Maroc - Accès partenaire 30 jours`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      inspectorId,
      plan,
      type: "subscription",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}
