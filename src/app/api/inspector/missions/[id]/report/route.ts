import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "INSPECTOR") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { id, inspectorId: session.user.id },
    include: { inspector: { select: { inspectorProfile: true } } },
  });

  if (!order) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });

  const body = await req.json();
  const {
    checklistData, inspectorNotes, estimatedRepairMin, estimatedRepairMax,
    estimatedMarketValue, recommendation, status,
  } = body;

  const inspectorProfile = await prisma.inspectorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!inspectorProfile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  // Upsert report
  const report = await prisma.report.upsert({
    where: { orderId: id },
    create: {
      orderId: id,
      inspectorId: inspectorProfile.id,
      checklistData,
      inspectorNotes,
      estimatedRepairMin,
      estimatedRepairMax,
      estimatedMarketValue,
      recommendation,
      status,
      submittedAt: status === "SUBMITTED" ? new Date() : undefined,
    },
    update: {
      checklistData,
      inspectorNotes,
      estimatedRepairMin,
      estimatedRepairMax,
      estimatedMarketValue,
      recommendation,
      status,
      submittedAt: status === "SUBMITTED" ? new Date() : undefined,
    },
  });

  // If submitted, update order status to QUALITY_CHECK
  if (status === "SUBMITTED") {
    await prisma.order.update({
      where: { id },
      data: { status: "QUALITY_CHECK" },
    });

    // Notify admin
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (adminUser) {
      await createNotification({
        userId: adminUser.id,
        type: "REPORT_SUBMITTED",
        title: "Rapport soumis pour révision",
        message: `Le rapport pour la commande IVM-${id.slice(-8).toUpperCase()} est prêt pour validation.`,
        metadata: { orderId: id },
      });
    }
  }

  return NextResponse.json({ success: true, reportId: report.id });
}
