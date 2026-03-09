import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "INSPECTOR") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { status } = await req.json();
  const allowedTransitions: Record<string, string[]> = {
    ASSIGNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["QUALITY_CHECK"],
  };

  const order = await prisma.order.findFirst({
    where: { id, inspectorId: session.user.id },
  });

  if (!order) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });

  if (!allowedTransitions[order.status]?.includes(status)) {
    return NextResponse.json({ error: "Transition de statut non autorisée" }, { status: 400 });
  }

  await prisma.order.update({ where: { id }, data: { status } });

  return NextResponse.json({ success: true, status });
}
