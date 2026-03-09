"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Salé", "Nador",
  "Mohammédia", "El Jadida", "Beni Mellal", "Témara",
];

const CERTIFICATION_OPTIONS = [
  "Ingénieur Génie Civil",
  "Ingénieur Structure",
  "Architecte DPLG",
  "Technicien BTP",
  "Expert Immobilier",
  "Ingénieur Électricité",
  "Ingénieur Plomberie",
];

const SUBSCRIPTION_PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: 300,
    missions: 5,
    share: 60,
    color: "border-gray-300",
    badge: "bg-gray-100 text-gray-700",
    features: ["5 missions/mois max", "60% de la commission", "Support standard"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 600,
    missions: 15,
    share: 70,
    color: "border-blue-500",
    badge: "bg-blue-100 text-blue-700",
    popular: true,
    features: ["15 missions/mois", "70% de la commission", "Badge Pro visible", "Support prioritaire"],
  },
  {
    id: "EXPERT",
    name: "Expert",
    price: 1000,
    missions: 99,
    share: 75,
    color: "border-yellow-500",
    badge: "bg-yellow-100 text-yellow-700",
    features: ["Missions illimitées", "75% de la commission", "Badge Expert", "Support dédié 24/7"],
  },
];

export default function InspectorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    bio: "",
    certifications: [] as string[],
    cities: [] as string[],
    experience: "",
    phone: "",
  });
  const [selectedPlan, setSelectedPlan] = useState("PRO");
  const [paymentMethod, setPaymentMethod] = useState("CARD");

  const toggleCity = (city: string) => {
    setProfile((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city],
    }));
  };

  const toggleCert = (cert: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const handleProfileSubmit = async () => {
    if (!profile.bio || profile.cities.length === 0 || profile.certifications.length === 0) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubscriptionSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // First save profile
      const profileRes = await fetch("/api/inspector/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!profileRes.ok) {
        const data = await profileRes.json();
        throw new Error(data.error || "Erreur lors de la création du profil");
      }

      // Then handle subscription
      const subRes = await fetch("/api/inspector/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, paymentMethod }),
      });

      if (!subRes.ok) {
        const data = await subRes.json();
        throw new Error(data.error || "Erreur lors de l'abonnement");
      }

      const subData = await subRes.json();

      if (subData.url) {
        window.location.href = subData.url;
      } else {
        router.push("/dashboard/inspector?onboarded=1");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">IV</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue chez Immo Verify Maroc</h1>
          <p className="text-gray-600 mt-2">Complétez votre profil pour commencer à recevoir des missions</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-10 gap-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                ${step >= s ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : s}
              </div>
              <span className={`text-sm font-medium ${step >= s ? "text-blue-900" : "text-gray-400"}`}>
                {s === 1 ? "Profil professionnel" : "Abonnement"}
              </span>
              {s < 2 && <div className={`w-16 h-0.5 ${step > s ? "bg-blue-900" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Votre profil professionnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="+212 6XX XXX XXX"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Années d&apos;expérience
                </label>
                <Input
                  placeholder="Ex: 8"
                  type="number"
                  value={profile.experience}
                  onChange={(e) => setProfile((p) => ({ ...p, experience: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications et qualifications <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATION_OPTIONS.map((cert) => (
                    <button
                      key={cert}
                      onClick={() => toggleCert(cert)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all
                        ${profile.certifications.includes(cert)
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                        }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
                {profile.certifications.length > 0 && (
                  <p className="text-xs text-blue-700 mt-2">
                    {profile.certifications.length} sélectionné(s)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Villes d&apos;intervention <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOROCCAN_CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => toggleCity(city)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all
                        ${profile.cities.includes(city)
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                        }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                {profile.cities.length > 0 && (
                  <p className="text-xs text-blue-700 mt-2">
                    {profile.cities.length} ville(s) sélectionnée(s)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Présentation professionnelle <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Décrivez votre parcours, vos spécialités et ce que vous apportez à vos clients..."
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                />
                <p className="text-xs text-gray-400 mt-1">{profile.bio.length}/500 caractères</p>
              </div>

              <Button
                onClick={handleProfileSubmit}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3"
              >
                Continuer vers l&apos;abonnement →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Subscription */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Choisissez votre abonnement</CardTitle>
                <p className="text-sm text-gray-600">
                  Votre abonnement mensuel vous donne accès aux missions et détermine votre
                  commission sur chaque inspection.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all
                      ${selectedPlan === plan.id
                        ? plan.color + " bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${selectedPlan === plan.id ? "border-blue-900 bg-blue-900" : "border-gray-300"}`}>
                          {selectedPlan === plan.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900">{plan.name}</span>
                          {plan.popular && (
                            <Badge className="ml-2 bg-blue-900 text-white text-xs">Populaire</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xl text-gray-900">{plan.price}</span>
                        <span className="text-gray-500 text-sm"> MAD/mois</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5 ml-8">
                      {plan.features.map((f) => (
                        <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-green-600">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-base">Mode de paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: "CARD", label: "Carte bancaire (Stripe)", icon: "💳" },
                  { id: "WIRE", label: "Virement bancaire", icon: "🏦" },
                  { id: "WAFACASH", label: "Wafacash / Cash Plus", icon: "💵" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                      ${paymentMethod === method.id
                        ? "border-blue-900 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-medium text-gray-900">{method.label}</span>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${paymentMethod === method.id ? "border-blue-900 bg-blue-900" : "border-gray-300"}`}>
                      {paymentMethod === method.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 py-3"
              >
                ← Retour
              </Button>
              <Button
                onClick={handleSubscriptionSubmit}
                loading={loading}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3"
              >
                {paymentMethod === "CARD"
                  ? "Payer et activer mon compte"
                  : "Soumettre ma demande"}
              </Button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              En vous abonnant, vous acceptez nos conditions d&apos;utilisation et la charte des
              inspecteurs partenaires.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
