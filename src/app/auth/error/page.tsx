"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const messages: Record<string, string> = {
    Configuration: "Erreur de configuration du serveur.",
    AccessDenied: "Accès refusé.",
    Verification: "Le lien de vérification a expiré.",
    Default: "Une erreur d'authentification est survenue.",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur d&apos;authentification</h1>
        <p className="text-gray-600 mb-6">
          {messages[error || "Default"] || messages.Default}
        </p>
        <Link href="/auth/login">
          <Button>Retourner à la connexion</Button>
        </Link>
      </div>
    </div>
  );
}
