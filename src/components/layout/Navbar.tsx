"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!session) return "/auth/login";
    switch (session.user.role) {
      case "ADMIN": return "/dashboard/admin";
      case "INSPECTOR": return "/dashboard/inspector";
      default: return "/dashboard/client";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A4A8A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IV</span>
            </div>
            <span className="font-bold text-[#1A4A8A] text-lg hidden sm:block">
              Immo Verify <span className="text-[#B8860B]">Maroc</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/tarifs" className="text-sm text-gray-600 hover:text-[#1A4A8A] transition-colors">
              Tarifs
            </Link>
            <Link href="/a-propos" className="text-sm text-gray-600 hover:text-[#1A4A8A] transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-[#1A4A8A] transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1A4A8A] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#1A4A8A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href={getDashboardLink()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      href="/dashboard/notifications"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link href="/commander">
                  <Button size="sm">Commander</Button>
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#1A4A8A]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden border-t border-gray-100 bg-white", mobileOpen ? "block" : "hidden")}>
        <div className="px-4 py-3 space-y-2">
          <Link href="/tarifs" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
            Tarifs
          </Link>
          <Link href="/a-propos" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
            À propos
          </Link>
          <Link href="/contact" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
            Contact
          </Link>
          {session && (
            <Link href={getDashboardLink()} className="block py-2 text-sm text-[#1A4A8A] font-medium" onClick={() => setMobileOpen(false)}>
              Tableau de bord
            </Link>
          )}
          {!session && (
            <div className="pt-2 flex gap-2">
              <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Connexion</Button>
              </Link>
              <Link href="/commander" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Commander</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
