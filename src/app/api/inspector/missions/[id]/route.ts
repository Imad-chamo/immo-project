import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
    include: { report: true },
  });

  if (!order) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });

  return NextResponse.json({ order });
}
