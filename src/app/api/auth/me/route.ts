import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  return NextResponse.json({ id: session.user.id, role: session.user.role, name: session.user.name });
}
