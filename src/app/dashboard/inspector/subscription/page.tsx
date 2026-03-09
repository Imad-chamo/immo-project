"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Star, Zap } from "lucide-react";
import { formatMAD } from "@/lib/utils";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: 300,
    features: [
      "Accès aux missions Essentiel",
      "1-3 missions/mois",
      "Support email",
      "Badge Starter",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 600,
    popular: true,
    features: [
      "Accès missions Essentiel + Standard",
      "5-10 missions/mois",
      "Support prioritaire",
      "Badge Pro",
      "Statistiques de performance",
    ],
  },
  {
    id: "EXPERT",
    name: "Expert",
    price: 1000,
    features: [
      "Accès toutes missions",
      "Missions illimitées",
      "Support dédié WhatsApp",
      "Badge Expert",
      "Mise en avant du profil",
      "Accès Premium missions",
    ],
  },
];

export default function InspectorSubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("PRO");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inspector/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (paymentMethod === "CARD" && data.stripeUrl) {
        window.location.href = data.stripeUrl;
      } else {
        router.push("/dashboard/inspector?subscribed=manual");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  const plan = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Choisir votre abonnement</h1>
          <p className="text-gray-600 mt-2">
            Un abonnement mensuel vous donne accès aux missions dans vos villes.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PLANS.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all relative ${
                selectedPlan === p.id
                  ? "border-[#1A4A8A] bg-[#1A4A8A]/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#1A4A8A] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Populaire
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === p.id ? "border-[#1A4A8A]" : "border-gray-300"
                }`}>
                  {selectedPlan === p.id && <div className="w-2.5 h-2.5 bg-[#1A4A8A] rounded-full" />}
                </div>
                <span className="font-bold text-gray-900">{p.name}</span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-[#1A4A8A]">{p.price}</span>
                <span className="text-gray-500 text-sm"> MAD/mois</span>
              </div>
              <ul className="space-y-2">
                {p.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#1A6B3A] shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment method */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Mode de paiement</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {[
              { id: "CARD", label: "Carte bancaire (Stripe)" },
              { id: "WIRE", label: "Virement bancaire" },
              { id: "WAFACASH", label: "Wafacash / Jibi" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  paymentMethod === method.id
                    ? "border-[#1A4A8A] bg-[#1A4A8A] text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {method.label}
              </button>
            ))}
          </CardContent>
        </Card>

        {paymentMethod !== "CARD" && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <p className="font-semibold text-amber-900 mb-2">Instructions de paiement manuel</p>
              <p className="text-sm text-amber-800">
                Envoyez {formatMAD(plan?.price || 0)} à notre compte avec la référence{" "}
                <strong>ABN-{selectedPlan}</strong>. Votre abonnement sera activé sous 24h après confirmation.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">
              Total: {formatMAD(plan?.price || 0)}/mois
            </p>
            <p className="text-sm text-gray-500">Renouvellement mensuel</p>
          </div>
          <Button size="lg" onClick={handleSubscribe} loading={loading}>
            <Zap className="h-4 w-4" />
            {paymentMethod === "CARD" ? "Payer par carte" : "Confirmer l'abonnement"}
          </Button>
        </div>
      </div>
    </div>
  );
}
