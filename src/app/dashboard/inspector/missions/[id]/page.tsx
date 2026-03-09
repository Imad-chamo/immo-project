"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Camera, Upload, CheckCircle2, AlertTriangle, XCircle,
  MapPin, Home, Zap, Droplets, DoorOpen, Layers, ChevronDown, ChevronUp,
} from "lucide-react";
import { getFormulaLabel, getOrderStatusLabel } from "@/lib/utils";

const CHECKLIST_SECTIONS = [
  {
    id: "structure",
    label: "Structure",
    icon: <Layers className="h-5 w-5" />,
    items: ["Murs porteurs", "Toiture", "Fondations", "Façade extérieure"],
  },
  {
    id: "humidity",
    label: "Humidité & infiltrations",
    icon: <Droplets className="h-5 w-5" />,
    items: ["Sous-sol / vide sanitaire", "Murs intérieurs", "Salle de bain", "Terrasse / balcon"],
  },
  {
    id: "electrical",
    label: "Installation électrique",
    icon: <Zap className="h-5 w-5" />,
    items: ["Tableau électrique", "Prises et interrupteurs", "Câblage apparent", "Mise à la terre"],
  },
  {
    id: "plumbing",
    label: "Plomberie",
    icon: <Droplets className="h-5 w-5" />,
    items: ["Tuyauterie eau froide/chaude", "Évacuations", "Chauffe-eau", "Robinetterie"],
  },
  {
    id: "carpentry",
    label: "Menuiserie",
    icon: <DoorOpen className="h-5 w-5" />,
    items: ["Fenêtres et vitrage", "Portes intérieures", "Porte d'entrée", "Volets"],
  },
  {
    id: "general",
    label: "État général",
    icon: <Home className="h-5 w-5" />,
    items: ["Sols", "Plafonds", "Peinture", "Cuisine équipée"],
  },
];

type ChecklistEntry = {
  rating: number;
  comment: string;
  photos: string[];
};

type ChecklistData = Record<string, Record<string, ChecklistEntry>>;

type OrderData = {
  id: string;
  status: string;
  formula: string;
  propertyAddress: string;
  propertyCity: string;
  propertyType: string;
  surfaceArea: number | null;
  inspectorShare: number | null;
  notes: string | null;
  paymentMethod: string;
  cashAmountByClient: number | null;
  report: {
    id: string;
    checklistData: ChecklistData | null;
    inspectorNotes: string | null;
    estimatedRepairMin: number | null;
    estimatedRepairMax: number | null;
    estimatedMarketValue: number | null;
    recommendation: string | null;
  } | null;
};

export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("structure");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Report state
  const [checklistData, setChecklistData] = useState<ChecklistData>({});
  const [inspectorNotes, setInspectorNotes] = useState("");
  const [repairMin, setRepairMin] = useState("");
  const [repairMax, setRepairMax] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Cash confirmation
  const [cashAmount, setCashAmount] = useState("");
  const [cashConfirmed, setCashConfirmed] = useState(false);

  useEffect(() => {
    fetch(`/api/inspector/missions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        if (data.order?.report?.checklistData) {
          setChecklistData(data.order.report.checklistData as ChecklistData);
        }
        if (data.order?.report?.inspectorNotes) setInspectorNotes(data.order.report.inspectorNotes);
        if (data.order?.report?.estimatedRepairMin) setRepairMin(String(data.order.report.estimatedRepairMin));
        if (data.order?.report?.estimatedRepairMax) setRepairMax(String(data.order.report.estimatedRepairMax));
        if (data.order?.report?.estimatedMarketValue) setMarketValue(String(data.order.report.estimatedMarketValue));
        if (data.order?.report?.recommendation) setRecommendation(data.order.report.recommendation);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const updateChecklist = (sectionId: string, item: string, field: keyof ChecklistEntry, value: string | number) => {
    setChecklistData((prev) => {
      const existing = prev[sectionId]?.[item] || { rating: 0, comment: "", photos: [] };
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          [item]: { ...existing, [field]: value },
        },
      };
    });
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/inspector/missions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      setSuccess(`Statut mis à jour: ${getOrderStatusLabel(newStatus)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/inspector/missions/${id}/report`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistData,
          inspectorNotes,
          estimatedRepairMin: repairMin ? parseFloat(repairMin) : null,
          estimatedRepairMax: repairMax ? parseFloat(repairMax) : null,
          estimatedMarketValue: marketValue ? parseFloat(marketValue) : null,
          recommendation,
          status: "DRAFT",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Brouillon sauvegardé");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!recommendation) {
      setError("Veuillez choisir une recommandation");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/inspector/missions/${id}/report`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistData,
          inspectorNotes,
          estimatedRepairMin: repairMin ? parseFloat(repairMin) : null,
          estimatedRepairMax: repairMax ? parseFloat(repairMax) : null,
          estimatedMarketValue: marketValue ? parseFloat(marketValue) : null,
          recommendation,
          status: "SUBMITTED",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Rapport soumis pour validation ! Notre équipe le vérifiera sous 24h.");
      setOrder((prev) => prev ? { ...prev, status: "QUALITY_CHECK" } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleCashConfirm = async () => {
    if (!cashAmount) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/inspector/missions/${id}/cash-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(cashAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCashConfirmed(true);
      setSuccess("Paiement cash confirmé !");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionId?: string, item?: string) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "reports");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (sectionId && item) {
          updateChecklist(sectionId, item, "photos", data.url);
        } else {
          setUploadedPhotos((p) => [...p, data.url]);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#1A4A8A] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center">Mission introuvable</div>;

  const canSubmitReport = order.status === "IN_PROGRESS";
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/dashboard/inspector" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1A4A8A] mb-4">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        {/* Mission header */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono font-bold text-[#1A4A8A]">
                  IVM-{order.id.slice(-8).toUpperCase()}
                </p>
                <p className="font-semibold text-gray-900 mt-1">{getFormulaLabel(order.formula)}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  {order.propertyAddress}, {order.propertyCity}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={order.status === "DELIVERED" ? "success" : "default"}>
                  {getOrderStatusLabel(order.status)}
                </Badge>
                <p className="text-lg font-bold text-[#1A6B3A] mt-2">
                  {order.inspectorShare?.toLocaleString()} MAD
                </p>
                <p className="text-xs text-gray-500">votre rémunération</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                <strong>Notes client:</strong> {order.notes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status actions */}
        {order.status === "ASSIGNED" && (
          <Button
            className="w-full mb-4"
            onClick={() => handleUpdateStatus("IN_PROGRESS")}
            loading={saving}
          >
            🚗 Je pars en inspection
          </Button>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Cash confirmation */}
        {order.paymentMethod !== "CARD" && order.status === "IN_PROGRESS" && !cashConfirmed && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-sm text-amber-900">Confirmer le paiement cash reçu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                label="Montant reçu (MAD)"
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder={String(order.cashAmountByClient || "")}
              />
              <Button
                onClick={handleCashConfirm}
                loading={saving}
                variant="gold"
                className="w-full"
              >
                Confirmer réception du paiement
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Report form */}
        {(order.status === "IN_PROGRESS" || order.status === "QUALITY_CHECK") && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Rapport d&apos;inspection</h2>

            {/* Checklist sections */}
            {CHECKLIST_SECTIONS.map((section) => (
              <Card key={section.id}>
                <button
                  className="w-full text-left p-4 flex items-center justify-between"
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-[#1A4A8A]">{section.icon}</div>
                    <span className="font-medium text-gray-900">{section.label}</span>
                    {checklistData[section.id] && (
                      <Badge variant="success">
                        {Object.keys(checklistData[section.id]).length}/{section.items.length}
                      </Badge>
                    )}
                  </div>
                  {activeSection === section.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {activeSection === section.id && (
                  <CardContent className="p-4 pt-0 space-y-4 border-t border-gray-100">
                    {section.items.map((item) => (
                      <div key={item} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800 mb-3">{item}</p>

                        {/* Rating */}
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Note (1=Mauvais, 5=Excellent)</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => updateChecklist(section.id, item, "rating", r)}
                                className={`w-9 h-9 rounded-lg text-sm font-bold border-2 transition-colors ${
                                  checklistData[section.id]?.[item]?.rating === r
                                    ? r <= 2
                                      ? "bg-red-500 border-red-500 text-white"
                                      : r === 3
                                      ? "bg-amber-500 border-amber-500 text-white"
                                      : "bg-[#1A6B3A] border-[#1A6B3A] text-white"
                                    : "border-gray-300 text-gray-600 hover:border-[#1A4A8A]"
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment */}
                        <Textarea
                          placeholder="Commentaire (optionnel)..."
                          value={checklistData[section.id]?.[item]?.comment || ""}
                          onChange={(e) => updateChecklist(section.id, item, "comment", e.target.value)}
                          rows={2}
                          className="text-sm"
                        />

                        {/* Photo upload */}
                        <label className="mt-2 flex items-center gap-2 text-xs text-[#1A4A8A] cursor-pointer hover:underline">
                          <Camera className="h-4 w-4" />
                          Ajouter des photos
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, section.id, item)}
                          />
                        </label>
                        {checklistData[section.id]?.[item]?.photos?.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {(checklistData[section.id][item].photos as string[]).map((url: string, i: number) => (
                              <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}

            {/* General info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations complémentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  label="Notes et observations générales"
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="Observations importantes, recommandations spécifiques..."
                  rows={4}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Coût rénovation min (MAD)"
                    type="number"
                    value={repairMin}
                    onChange={(e) => setRepairMin(e.target.value)}
                    placeholder="50000"
                  />
                  <Input
                    label="Coût rénovation max (MAD)"
                    type="number"
                    value={repairMax}
                    onChange={(e) => setRepairMax(e.target.value)}
                    placeholder="120000"
                  />
                </div>
                <Input
                  label="Valeur marché estimée (MAD)"
                  type="number"
                  value={marketValue}
                  onChange={(e) => setMarketValue(e.target.value)}
                  placeholder="850000"
                />

                {/* Video upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Vidéo de la visite</label>
                  <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#1A4A8A] transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Uploader une vidéo</span>
                    <input type="file" accept="video/*" className="hidden" />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommandation finale *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "ACHETER", label: "Acheter", icon: <CheckCircle2 className="h-5 w-5" />, color: "text-[#1A6B3A]", bg: "bg-green-50 border-green-200", active: "bg-[#1A6B3A] border-[#1A6B3A] text-white" },
                    { id: "NEGOCIER", label: "Négocier", icon: <AlertTriangle className="h-5 w-5" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", active: "bg-amber-500 border-amber-500 text-white" },
                    { id: "EVITER", label: "Éviter", icon: <XCircle className="h-5 w-5" />, color: "text-red-600", bg: "bg-red-50 border-red-200", active: "bg-red-500 border-red-500 text-white" },
                  ].map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => setRecommendation(rec.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                        recommendation === rec.id ? rec.active : `${rec.bg} ${rec.color}`
                      }`}
                    >
                      {rec.icon}
                      {rec.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit buttons */}
            {canSubmitReport && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSaveDraft} loading={saving} className="flex-1">
                  Sauvegarder
                </Button>
                <Button onClick={handleSubmitReport} loading={saving} className="flex-1">
                  Soumettre le rapport
                </Button>
              </div>
            )}

            {order.status === "QUALITY_CHECK" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <p className="text-sm font-medium text-blue-900">Rapport soumis pour validation</p>
                <p className="text-sm text-blue-700 mt-1">Notre équipe qualité vérifie votre rapport.</p>
              </div>
            )}
          </div>
        )}

        {isDelivered && (
          <Card className="border-[#1A6B3A]">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-[#1A6B3A] mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Mission terminée avec succès !</p>
              <p className="text-sm text-gray-600 mt-1">Le rapport a été livré au client.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
