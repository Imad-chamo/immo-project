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

  const { action } = await req.json();

  const profile = await prisma.inspectorProfile.findUnique({
    where: { userId: id },
  });

  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  switch (action) {
    case "approve":
      await prisma.inspectorProfile.update({
        where: { userId: id },
        data: { isApproved: true, isActive: true },
      });
      // Notify inspector
      await prisma.notification.create({
        data: {
          userId: id,
          type: "PROFILE_APPROVED",
          title: "Profil approuvé !",
          message: "Votre profil a été approuvé. Vous pouvez maintenant recevoir des missions.",
        },
      });
      return NextResponse.json({ message: "Inspecteur approuvé" });

    case "reject":
      await prisma.inspectorProfile.update({
        where: { userId: id },
        data: { isApproved: false },
      });
      return NextResponse.json({ message: "Inspecteur rejeté" });

    case "suspend":
      await prisma.inspectorProfile.update({
        where: { userId: id },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Inspecteur suspendu" });

    case "activate":
      await prisma.inspectorProfile.update({
        where: { userId: id },
        data: { isActive: true },
      });
      return NextResponse.json({ message: "Inspecteur réactivé" });

    default:
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }
}
