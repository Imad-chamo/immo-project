"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2, ChevronRight, ChevronLeft, CreditCard,
  Banknote, Building2, Upload, MapPin,
} from "lucide-react";
import { formatMAD, MOROCCAN_CITIES, PROPERTY_TYPES } from "@/lib/utils";

const FORMULAS = [
  {
    id: "ESSENTIEL",
    name: "Essentiel",
    price: 1200,
    features: ["Visite 2h", "Rapport PDF", "Photos commentées", "Évaluation des risques"],
  },
  {
    id: "STANDARD",
    name: "Standard",
    price: 2500,
    features: ["Visite 3-4h", "Rapport complet 20+ pages", "Photos HD + vidéo", "Estimation rénovation"],
    popular: true,
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 5000,
    features: ["Visite 5-6h", "Rapport expert 40+ pages", "Drone + thermique", "Suivi négociation"],
  },
];

const PAYMENT_METHODS = [
  { id: "CARD", label: "Carte bancaire", icon: <CreditCard className="h-5 w-5" />, desc: "Visa, Mastercard — Paiement immédiat" },
  { id: "WAFACASH", label: "Wafacash / Jibi", icon: <Banknote className="h-5 w-5" />, desc: "Paiement en agence ou mobile" },
  { id: "WIRE", label: "Virement bancaire", icon: <Building2 className="h-5 w-5" />, desc: "Virement depuis votre compte" },
  { id: "WESTERN_UNION", label: "Western Union", icon: <Banknote className="h-5 w-5" />, desc: "Idéal depuis l'étranger" },
];

export default function CommanderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formula, setFormula] = useState(searchParams.get("formula") || "STANDARD");
  const [propertyData, setPropertyData] = useState({
    address: "",
    city: "",
    propertyType: "",
    surfaceArea: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/commander`);
    }
  }, [status, router]);

  const selectedFormula = FORMULAS.find((f) => f.id === formula);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formula,
          propertyAddress: propertyData.address,
          propertyCity: propertyData.city,
          propertyType: propertyData.propertyType,
          surfaceArea: propertyData.surfaceArea ? parseFloat(propertyData.surfaceArea) : null,
          notes: propertyData.notes,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrderId(data.orderId);

      // If card payment, redirect to Stripe
      if (paymentMethod === "CARD" && data.stripeUrl) {
        window.location.href = data.stripeUrl;
        return;
      }

      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentProof = async () => {
    if (!paymentProofFile || !paymentAmount) {
      setError("Veuillez entrer le montant et la preuve de paiement");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", paymentProofFile);
      formData.append("orderId", orderId);
      formData.append("amount", paymentAmount);

      const res = await fetch("/api/orders/payment-proof", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#1A4A8A] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {["Formule", "Bien", "Paiement", "Confirmation"].map((label, i) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                  step > i + 1 ? "bg-[#1A6B3A] text-white" :
                  step === i + 1 ? "bg-[#1A4A8A] text-white" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`hidden sm:block ml-2 text-sm ${step === i + 1 ? "text-[#1A4A8A] font-medium" : "text-gray-500"}`}>
                  {label}
                </span>
                {i < 3 && <div className={`hidden sm:block h-px w-16 lg:w-24 mx-3 ${step > i + 1 ? "bg-[#1A6B3A]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ─── STEP 1: Formula ─── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre formule</h1>
            <p className="text-gray-600 mb-6">Sélectionnez la formule adaptée à votre bien</p>
            <div className="grid gap-4">
              {FORMULAS.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setFormula(f.id)}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    formula === f.id
                      ? "border-[#1A4A8A] bg-[#1A4A8A]/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formula === f.id ? "border-[#1A4A8A]" : "border-gray-300"
                      }`}>
                        {formula === f.id && <div className="w-2.5 h-2.5 bg-[#1A4A8A] rounded-full" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{f.name}</span>
                          {f.popular && (
                            <span className="text-xs bg-[#1A4A8A] text-white px-2 py-0.5 rounded-full">Populaire</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {f.features.map((feat) => (
                            <span key={feat} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-bold text-[#1A4A8A]">{f.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm"> MAD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)} size="lg">
                Continuer <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Property details ─── */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Détails du bien</h1>
            <p className="text-gray-600 mb-6">Renseignez les informations sur le bien à inspecter</p>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Input
                  label="Adresse complète du bien *"
                  placeholder="123 Rue Mohammed V, Quartier Maarif"
                  value={propertyData.address}
                  onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Ville *</label>
                  <Select
                    value={propertyData.city}
                    onValueChange={(val) => setPropertyData({ ...propertyData, city: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOROCCAN_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Type de bien *</label>
                  <Select
                    value={propertyData.propertyType}
                    onValueChange={(val) => setPropertyData({ ...propertyData, propertyType: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  label="Surface approximative (m²)"
                  type="number"
                  placeholder="85"
                  value={propertyData.surfaceArea}
                  onChange={(e) => setPropertyData({ ...propertyData, surfaceArea: e.target.value })}
                />
                <Textarea
                  label="Notes ou informations supplémentaires"
                  placeholder="Étage, code d'accès, contact du vendeur, points particuliers à vérifier..."
                  value={propertyData.notes}
                  onChange={(e) => setPropertyData({ ...propertyData, notes: e.target.value })}
                  rows={4}
                />
              </CardContent>
            </Card>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!propertyData.address || !propertyData.city || !propertyData.propertyType}
              >
                Continuer <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Payment ─── */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement</h1>
            <p className="text-gray-600 mb-6">Choisissez votre mode de paiement</p>

            {/* Order summary */}
            <Card className="mb-6 bg-[#1A4A8A] text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Formule sélectionnée</p>
                    <p className="text-xl font-bold">{selectedFormula?.name}</p>
                    <div className="flex items-center gap-1 text-blue-200 text-sm mt-1">
                      <MapPin className="h-3 w-3" />
                      {propertyData.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200 text-sm">Total à payer</p>
                    <p className="text-3xl font-bold text-[#B8860B]">
                      {formatMAD(selectedFormula?.price || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 mb-6">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-[#1A4A8A] bg-[#1A4A8A]/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === method.id ? "border-[#1A4A8A]" : "border-gray-300"
                  }`}>
                    {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-[#1A4A8A] rounded-full" />}
                  </div>
                  <div className="text-[#1A4A8A]">{method.icon}</div>
                  <div>
                    <p className="font-medium text-gray-900">{method.label}</p>
                    <p className="text-sm text-gray-500">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual payment instructions */}
            {paymentMethod === "WAFACASH" && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-amber-900 mb-2">Instructions Wafacash / Jibi</h3>
                  <p className="text-sm text-amber-800">
                    Envoyez <strong>{formatMAD(selectedFormula?.price || 0)}</strong> au numéro :{" "}
                    <strong className="text-lg">0600000000</strong> (Immo Verify Maroc)
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    Après envoi, cliquez sur &quot;Confirmer le paiement&quot; et uploadez votre reçu.
                  </p>
                </CardContent>
              </Card>
            )}

            {paymentMethod === "WIRE" && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Coordonnées bancaires (RIB)</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Banque :</strong> Attijariwafa Bank</p>
                    <p><strong>Titulaire :</strong> Immo Verify Maroc SARL</p>
                    <p><strong>RIB :</strong> 007 780 0000000000000000 12</p>
                    <p><strong>Montant :</strong> {formatMAD(selectedFormula?.price || 0)}</p>
                    <p><strong>Référence :</strong> Votre email</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === "WESTERN_UNION" && (
              <Card className="mb-6 border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Instructions Western Union</h3>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p><strong>Bénéficiaire :</strong> Immo Verify Maroc</p>
                    <p><strong>Ville :</strong> Casablanca, Maroc</p>
                    <p><strong>Montant :</strong> {formatMAD(selectedFormula?.price || 0)}</p>
                    <p>Conservez votre MTCN (numéro de transfert) pour la confirmation.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
              <Button onClick={handleCreateOrder} loading={loading} size="lg">
                {paymentMethod === "CARD" ? "Payer par carte" : "Confirmer la commande"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Payment proof for manual methods after order creation */}
            {orderId && paymentMethod !== "CARD" && (
              <Card className="mt-6 border-green-200">
                <CardHeader>
                  <CardTitle className="text-base text-[#1A6B3A]">Confirmer votre paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    label="Montant payé (MAD)"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={selectedFormula?.price.toString()}
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Reçu / preuve de paiement (photo)
                    </label>
                    <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#1A4A8A] transition-colors">
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {paymentProofFile ? paymentProofFile.name : "Cliquer pour uploader"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <Button onClick={handlePaymentProof} loading={loading} variant="success" className="w-full">
                    J&apos;ai payé — Envoyer la preuve
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ─── STEP 4: Confirmation ─── */}
        {step === 4 && (
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-[#1A6B3A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-[#1A6B3A]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
              <p className="text-gray-600 mb-2">
                Votre commande <strong className="text-[#1A4A8A]">IVM-{orderId.slice(-8).toUpperCase()}</strong> a été reçue.
              </p>
              {paymentMethod !== "CARD" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4 text-sm text-amber-800">
                  Votre commande sera activée après confirmation de votre paiement par notre équipe (sous 2-4h en jours ouvrables).
                </div>
              )}
              <p className="text-sm text-gray-600 mb-6">
                Un inspecteur certifié sera assigné dans les 24h. Vous recevrez une notification WhatsApp et email.
              </p>
              <Button onClick={() => router.push("/dashboard/client")} size="lg">
                Voir ma commande
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
