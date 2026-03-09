import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import DashboardNav from "@/components/layout/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role={session.user.role} name={session.user.name || ""} />
      <main>{children}</main>
    </div>
  );
}
