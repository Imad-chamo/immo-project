import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { confirmed } = await req.json();

  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: { inspector: true },
  });

  if (!sub) return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });

  if (confirmed) {
    await prisma.subscription.update({
      where: { id },
      data: { confirmedByAdmin: true, status: "ACTIVE" },
    });

    const badge = sub.plan === "EXPERT" ? "EXPERT" : sub.plan === "PRO" ? "PRO" : "STARTER";
    await prisma.inspectorProfile.update({
      where: { id: sub.inspectorId },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionEnd: sub.endDate,
        badge,
      },
    });
  } else {
    await prisma.subscription.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ success: true });
}
