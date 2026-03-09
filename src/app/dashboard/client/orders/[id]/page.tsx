import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Download, MapPin, Clock, User, CheckCircle2,
  AlertCircle, FileText, Building2,
} from "lucide-react";
import {
  formatMAD, formatDateTime, getOrderStatusLabel, getFormulaLabel,
  getPaymentMethodLabel,
} from "@/lib/utils";

const STATUS_STEPS = [
  { key: "PENDING", label: "Commande reçue", desc: "Votre commande est en cours de traitement" },
  { key: "ASSIGNED", label: "Inspecteur assigné", desc: "Un expert a été désigné pour votre mission" },
  { key: "IN_PROGRESS", label: "Inspection en cours", desc: "L'inspecteur visite le bien" },
  { key: "QUALITY_CHECK", label: "Contrôle qualité", desc: "Notre équipe révise le rapport" },
  { key: "DELIVERED", label: "Rapport livré", desc: "Votre rapport est disponible" },
];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/auth/login");

  const order = await prisma.order.findFirst({
    where: {
      id,
      ...(session.user.role === "CLIENT" ? { clientId: session.user.id } : {}),
    },
    include: {
      client: { select: { name: true, email: true } },
      inspector: { select: { name: true, image: true, inspectorProfile: { select: { badge: true, rating: true } } } },
      report: true,
    },
  });

  if (!order) notFound();

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const orderNum = `IVM-${order.id.slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard/client" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1A4A8A] mb-6">
          <ArrowLeft className="h-4 w-4" />
          Retour aux commandes
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{orderNum}</h1>
            <p className="text-gray-600">{getFormulaLabel(order.formula)} — {order.propertyCity}</p>
          </div>
          <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "destructive" : "default"}>
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suivi de votre inspection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isCompleted ? "bg-[#1A6B3A] text-white" :
                            isCurrent ? "bg-[#1A4A8A] text-white" :
                            "bg-gray-200 text-gray-400"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>
                          {index < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 h-8 mt-1 ${isCompleted ? "bg-[#1A6B3A]" : "bg-gray-200"}`} />
                          )}
                        </div>
                        <div className="pb-2">
                          <p className={`font-medium ${isCurrent ? "text-[#1A4A8A]" : isPending ? "text-gray-400" : "text-gray-900"}`}>
                            {step.label}
                          </p>
                          <p className="text-sm text-gray-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Property details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bien inspecté
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{order.propertyAddress}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                  <div>
                    <p className="text-gray-500">Type de bien</p>
                    <p className="font-medium capitalize">{order.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Formule</p>
                    <p className="font-medium">{getFormulaLabel(order.formula)}</p>
                  </div>
                  {order.surfaceArea && (
                    <div>
                      <p className="text-gray-500">Surface</p>
                      <p className="font-medium">{order.surfaceArea} m²</p>
                    </div>
                  )}
                  {order.scheduledDate && (
                    <div>
                      <p className="text-gray-500">Date d&apos;inspection</p>
                      <p className="font-medium">{formatDateTime(order.scheduledDate)}</p>
                    </div>
                  )}
                </div>
                {order.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report (when delivered) */}
            {order.status === "DELIVERED" && order.report && (
              <Card className="border-[#1A6B3A] border-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-[#1A6B3A]">
                    <FileText className="h-4 w-4" />
                    Rapport d&apos;inspection disponible
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.report.pdfUrl ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Votre rapport a été approuvé par notre équipe qualité. Téléchargez-le ci-dessous.
                      </p>
                      {order.report.recommendation && (
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${
                          order.report.recommendation === "ACHETER"
                            ? "bg-green-100 text-green-800"
                            : order.report.recommendation === "NEGOCIER"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {order.report.recommendation === "ACHETER" && "✅ Recommandation: Acheter"}
                          {order.report.recommendation === "NEGOCIER" && "⚠️ Recommandation: Négocier"}
                          {order.report.recommendation === "EVITER" && "❌ Recommandation: Éviter"}
                        </div>
                      )}
                      <a href={order.report.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="success" className="w-full">
                          <Download className="h-4 w-4" />
                          Télécharger le rapport PDF
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Le rapport est en cours de génération...</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment proof status */}
            {order.paymentMethod !== "CARD" && order.paymentStatus === "PENDING" && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Paiement en cours de vérification</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Notre équipe vérifie votre paiement. Cela peut prendre 2-4h en jours ouvrables.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Inspector info (name & badge only, no contact) */}
            {order.inspector && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Votre inspecteur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1A4A8A] rounded-full flex items-center justify-center text-white font-bold">
                      {order.inspector.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.inspector.name}</p>
                      {order.inspector.inspectorProfile && (
                        <Badge variant="gold">
                          {order.inspector.inspectorProfile.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Pour votre sécurité, les coordonnées de l&apos;inspecteur ne sont pas visibles.
                    Contactez-nous via WhatsApp si besoin.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Order summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Résumé financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Formule {getFormulaLabel(order.formula)}</span>
                  <span className="font-medium">{formatMAD(order.clientPrice)}</span>
                </div>
                {order.creditApplied > 0 && (
                  <div className="flex justify-between text-[#1A6B3A]">
                    <span>Crédit parrainage</span>
                    <span>-{formatMAD(order.creditApplied)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold">
                  <span>Total payé</span>
                  <span>{formatMAD(order.clientPrice - order.creditApplied)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mode de paiement</span>
                  <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Statut paiement</span>
                  <Badge variant={order.paymentStatus === "CONFIRMED" ? "success" : "warning"}>
                    {order.paymentStatus === "CONFIRMED" ? "Confirmé" : "En attente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="h-3 w-3" />
                  <span>Commandé le</span>
                </div>
                <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                {order.deliveredAt && (
                  <>
                    <div className="flex items-center gap-2 text-gray-500 mt-2 mb-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Livré le</span>
                    </div>
                    <p className="font-medium">{formatDateTime(order.deliveredAt)}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
