import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Immo Verify Maroc — Inspection immobilière professionnelle",
  description:
    "Achetez au Maroc les yeux ouverts. La première plateforme indépendante d'inspection immobilière au Maroc. Ingénieurs certifiés, rapports détaillés.",
  keywords: ["inspection immobilière", "Maroc", "immobilier", "expertise", "rapport"],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1A4A8A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="fr">
      <body className={`${geistSans.variable} antialiased`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
