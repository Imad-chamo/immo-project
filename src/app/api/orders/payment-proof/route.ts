import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { notifyAdminPaymentProof } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const orderId = formData.get("orderId") as string;
    const amount = parseFloat(formData.get("amount") as string);

    if (!file || !orderId || isNaN(amount)) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: orderId, clientId: session.user.id },
    });
    if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

    // Upload proof to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const proofUrl = await uploadToCloudinary(buffer, "payment-proofs");

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: proofUrl,
        paymentAmountPaid: amount,
        paymentConfirmedByClient: true,
        cashAmountByClient: amount,
      },
    });

    // Notify admin
    await notifyAdminPaymentProof(orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment proof error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
