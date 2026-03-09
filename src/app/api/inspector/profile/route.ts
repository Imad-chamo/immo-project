import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bio, certifications, cities, phone } = body;

  if (!bio || !cities?.length || !certifications?.length) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const existing = await prisma.inspectorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    const updated = await prisma.inspectorProfile.update({
      where: { userId: session.user.id },
      data: { bio, certifications, cities },
    });
    if (phone) {
      await prisma.user.update({ where: { id: session.user.id }, data: { phone } });
    }
    return NextResponse.json(updated);
  }

  const profile = await prisma.inspectorProfile.create({
    data: {
      userId: session.user.id,
      bio,
      certifications,
      cities,
      subscriptionStatus: "EXPIRED",
      isApproved: false,
    },
  });

  if (phone) {
    await prisma.user.update({ where: { id: session.user.id }, data: { phone } });
  }

  return NextResponse.json(profile);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.inspectorProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile);
}
