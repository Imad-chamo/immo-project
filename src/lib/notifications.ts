import { Resend } from "resend";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ─── In-app notification ────────────────────────────────────────────────────

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { userId, type, title, message, metadata: (metadata as any) },
  });
}

// ─── Email ──────────────────────────────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error("Email send error:", error);
    return null;
  }
}

// ─── WhatsApp ───────────────────────────────────────────────────────────────

export async function sendWhatsApp(to: string, message: string) {
  if (!to) return null;
  try {
    const phone = to.startsWith("+") ? to : `+212${to.replace(/^0/, "")}`;
    const result = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${phone}`,
      body: message,
    });
    return result;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return null;
  }
}

// ─── Notification templates ─────────────────────────────────────────────────

export async function notifyOrderConfirmed(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true },
  });
  if (!order) return;

  const orderNum = `IVM-${orderId.slice(-8).toUpperCase()}`;

  await Promise.all([
    createNotification({
      userId: order.clientId,
      type: "ORDER_CONFIRMED",
      title: "Commande confirmée",
      message: `Votre commande ${orderNum} a été confirmée. Un inspecteur vous sera assigné sous peu.`,
      metadata: { orderId },
    }),
    sendEmail({
      to: order.client.email,
      subject: `Commande ${orderNum} confirmée - Immo Verify Maroc`,
      html: emailOrderConfirmed(order.client.name || "Client", orderNum),
    }),
    order.client.phone
      ? sendWhatsApp(
          order.client.phone,
          `Bonjour ${order.client.name}, votre inspection ${orderNum} est confirmée! Nous vous tiendrons informé de chaque étape.`
        )
      : null,
  ]);
}

export async function notifyInspectorAssigned(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true, inspector: true },
  });
  if (!order || !order.inspector) return;

  const orderNum = `IVM-${orderId.slice(-8).toUpperCase()}`;

  await Promise.all([
    createNotification({
      userId: order.clientId,
      type: "INSPECTOR_ASSIGNED",
      title: "Inspecteur assigné",
      message: `Un inspecteur a été assigné à votre commande ${orderNum}.`,
      metadata: { orderId },
    }),
    createNotification({
      userId: order.inspectorId!,
      type: "MISSION_ASSIGNED",
      title: "Nouvelle mission",
      message: `Vous avez une nouvelle mission: ${orderNum} à ${order.propertyCity}.`,
      metadata: { orderId },
    }),
    sendEmail({
      to: order.client.email,
      subject: `Inspecteur assigné - ${orderNum}`,
      html: `<p>Bonjour ${order.client.name},<br>Un inspecteur certifié a été assigné à votre inspection ${orderNum}.</p>`,
    }),
    order.inspector.phone
      ? sendWhatsApp(
          order.inspector.phone,
          `Nouvelle mission assignée: ${orderNum} à ${order.propertyCity}. Connectez-vous à votre tableau de bord pour les détails.`
        )
      : null,
  ]);
}

export async function notifyReportDelivered(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: true, report: true },
  });
  if (!order) return;

  const orderNum = `IVM-${orderId.slice(-8).toUpperCase()}`;

  await Promise.all([
    createNotification({
      userId: order.clientId,
      type: "REPORT_DELIVERED",
      title: "Rapport disponible",
      message: `Votre rapport d'inspection ${orderNum} est prêt. Téléchargez-le depuis votre tableau de bord.`,
      metadata: { orderId, pdfUrl: order.report?.pdfUrl },
    }),
    sendEmail({
      to: order.client.email,
      subject: `Rapport disponible - ${orderNum}`,
      html: emailReportDelivered(
        order.client.name || "Client",
        orderNum,
        order.report?.pdfUrl || ""
      ),
    }),
    order.client.phone
      ? sendWhatsApp(
          order.client.phone,
          `Votre rapport d'inspection ${orderNum} est prêt! Connectez-vous pour le télécharger.`
        )
      : null,
  ]);
}

export async function notifyAdminNewOrder(orderId: string) {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const orderNum = `IVM-${orderId.slice(-8).toUpperCase()}`;

  await sendEmail({
    to: adminEmail,
    subject: `Nouvelle commande ${orderNum}`,
    html: `<p>Une nouvelle commande ${orderNum} a été reçue. <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/orders/${orderId}">Voir la commande</a></p>`,
  });
}

export async function notifyAdminPaymentProof(orderId: string) {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const orderNum = `IVM-${orderId.slice(-8).toUpperCase()}`;

  await sendEmail({
    to: adminEmail,
    subject: `Preuve de paiement reçue - ${orderNum}`,
    html: `<p>Un client a soumis une preuve de paiement pour la commande ${orderNum}. <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/orders/${orderId}">Confirmer le paiement</a></p>`,
  });
}

// ─── Email templates ─────────────────────────────────────────────────────────

function emailOrderConfirmed(name: string, orderNum: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1A4A8A; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Immo Verify Maroc</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1A4A8A;">Commande confirmée ✓</h2>
        <p>Bonjour ${name},</p>
        <p>Votre commande <strong>${orderNum}</strong> a été confirmée avec succès.</p>
        <p>Un inspecteur certifié vous sera assigné dans les prochaines 24 heures.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client"
           style="display: inline-block; background: #1A4A8A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
          Suivre ma commande
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Immo Verify Maroc — Achetez au Maroc les yeux ouverts
        </p>
      </div>
    </body>
    </html>
  `;
}

function emailReportDelivered(name: string, orderNum: string, pdfUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1A4A8A; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Immo Verify Maroc</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1A6B3A;">Rapport disponible ✓</h2>
        <p>Bonjour ${name},</p>
        <p>Votre rapport d'inspection pour la commande <strong>${orderNum}</strong> est maintenant disponible.</p>
        ${pdfUrl ? `<a href="${pdfUrl}" style="display: inline-block; background: #1A6B3A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 8px 0 0;">Télécharger le rapport PDF</a>` : ""}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client"
           style="display: inline-block; background: #1A4A8A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
          Voir mon tableau de bord
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Immo Verify Maroc — Achetez au Maroc les yeux ouverts
        </p>
      </div>
    </body>
    </html>
  `;
}
