"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, FileText, Users, DollarSign, TrendingUp,
  Settings, LogOut, Menu, X, Bell, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  CLIENT: [
    { href: "/dashboard/client", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/commander", label: "Commander", icon: <Package className="h-4 w-4" /> },
    { href: "/dashboard/client/profile", label: "Mon profil", icon: <Settings className="h-4 w-4" /> },
  ],
  INSPECTOR: [
    { href: "/dashboard/inspector", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/dashboard/inspector/missions", label: "Mes missions", icon: <FileText className="h-4 w-4" /> },
    { href: "/dashboard/inspector/subscription", label: "Abonnement", icon: <DollarSign className="h-4 w-4" /> },
    { href: "/dashboard/inspector/profile", label: "Mon profil", icon: <Settings className="h-4 w-4" /> },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Vue d'ensemble", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/dashboard/admin/orders", label: "Commandes", icon: <Package className="h-4 w-4" /> },
    { href: "/dashboard/admin/inspectors", label: "Inspecteurs", icon: <Users className="h-4 w-4" /> },
    { href: "/dashboard/admin/payments", label: "Paiements", icon: <DollarSign className="h-4 w-4" /> },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: <TrendingUp className="h-4 w-4" /> },
  ],
};

export default function DashboardNav({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = NAV_LINKS[role] || [];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A4A8A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">IV</span>
            </div>
            <span className="font-bold text-[#1A4A8A] hidden sm:block">
              Immo Verify <span className="text-[#B8860B]">Maroc</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-[#1A4A8A] text-white"
                    : "text-gray-600 hover:text-[#1A4A8A] hover:bg-gray-100"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications" className="p-2 text-gray-600 hover:text-[#1A4A8A] rounded-md">
              <Bell className="h-5 w-5" />
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1A4A8A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:block">Déconnexion</span>
              </button>
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                pathname === link.href ? "bg-[#1A4A8A] text-white" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      )}
    </nav>
  );
}
