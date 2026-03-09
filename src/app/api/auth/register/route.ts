import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "INSPECTOR"]).default("CLIENT"),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Handle referral
    let referredById: string | undefined;
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode },
      });
      if (referrer) referredById = referrer.id;
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
        referredById,
        referralCode: `IVM${Math.random().toString(36).slice(-6).toUpperCase()}`,
      },
    });

    // Create inspector profile if role is INSPECTOR
    if (data.role === "INSPECTOR") {
      await prisma.inspectorProfile.create({
        data: {
          userId: user.id,
          cities: [],
          certifications: [],
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
