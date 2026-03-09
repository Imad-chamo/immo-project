"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl border-0">
        <CardContent className="p-10 text-center">
          {/* Success icon */}
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-14 h-14 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">Paiement confirmé !</h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            Votre commande a été enregistrée avec succès. Notre équipe va prendre en charge votre
            dossier et vous assigner un inspecteur certifié sous 24h.
          </p>

          {orderId && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-blue-600 font-medium mb-1">Référence de commande</p>
              <p className="font-mono text-blue-900 font-semibold text-sm break-all">{orderId}</p>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 text-xs font-bold">1</span>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Email de confirmation</strong> envoyé à votre adresse
              </p>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 text-xs font-bold">2</span>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Inspecteur assigné</strong> sous 24h avec notification WhatsApp
              </p>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 text-xs font-bold">3</span>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Rapport livré</strong> sous 48h après l&apos;inspection
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {orderId ? (
              <Link href={`/dashboard/client/orders/${orderId}`} className="flex-1">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Suivre ma commande
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/client" className="flex-1">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Mon tableau de bord
                </Button>
              </Link>
            )}
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full border-gray-300">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>

          {countdown > 0 && (
            <p className="text-xs text-gray-400 mt-6">
              Redirection automatique vers votre tableau de bord dans {countdown}s...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
