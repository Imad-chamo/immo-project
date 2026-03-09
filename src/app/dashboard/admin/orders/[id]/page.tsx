import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminOrderActions from "./AdminOrderActions";
import {
  ArrowLeft, MapPin, User, FileText, Building2, Clock, CheckCircle2, AlertTriangle,
} from "lucide-react";
import {
  formatMAD, formatDateTime, getOrderStatusLabel, getFormulaLabel,
  getPaymentMethodLabel, generateOrderNumber,
} from "@/lib/utils";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      inspector: {
        include: { inspectorProfile: { select: { badge: true, rating: true, cities: true } } },
      },
      report: true,
    },
  });

  if (!order) notFound();

  // Get available inspectors for this city
  const availableInspectors = await prisma.inspectorProfile.findMany({
    where: {
      isApproved: true,
      subscriptionStatus: "ACTIVE",
      cities: { has: order.propertyCity },
    },
    include: { user: { select: { id: true, name: true, phone: true } } },
  });

  const cashLogs = await prisma.cashConfirmationLog.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/dashboard/admin/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1A4A8A] mb-6">
          <ArrowLeft className="h-4 w-4" />
          Retour aux commandes
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{generateOrderNumber(order.id)}</h1>
            <p className="text-gray-600">{getFormulaLabel(order.formula)} — {order.propertyCity}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={order.paymentStatus === "CONFIRMED" ? "success" : "warning"}>
              Paiement: {order.paymentStatus === "CONFIRMED" ? "Confirmé" : "En attente"}
            </Badge>
            <Badge variant={
              order.status === "DELIVERED" ? "success" :
              order.status === "QUALITY_CHECK" ? "blue" :
              "secondary"
            }>
              {getOrderStatusLabel(order.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cash mismatch alert */}
            {order.cashMismatch && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">⚠ Incohérence de paiement cash détectée !</p>
                  <p className="text-sm text-red-700">
                    Client: {order.cashAmountByClient} MAD |
                    Inspecteur: {order.cashAmountByInspector} MAD
                  </p>
                  <p className="text-sm text-red-600 mt-1">Enquête manuelle requise avant de procéder.</p>
                </div>
              </div>
            )}

            {/* Payment proof */}
            {order.paymentProofUrl && order.paymentStatus === "PENDING" && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-base text-amber-900">Preuve de paiement reçue</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={order.paymentProofUrl}
                    alt="Preuve de paiement"
                    className="max-w-xs rounded-lg border mb-3"
                  />
                  <p className="text-sm text-amber-800">
                    Montant déclaré: <strong>{order.paymentAmountPaid} MAD</strong>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Property info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bien immobilier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{order.propertyAddress}, {order.propertyCity}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-gray-500">Type</p>
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
                </div>
                {order.notes && (
                  <div className="bg-gray-50 rounded p-3 mt-2">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p>{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium text-gray-900">{order.client.name}</p>
                <p className="text-gray-600">{order.client.email}</p>
                {order.client.phone && <p className="text-gray-600">{order.client.phone}</p>}
              </CardContent>
            </Card>

            {/* Report */}
            {order.report && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Rapport d&apos;inspection
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={
                      order.report.status === "DELIVERED" ? "success" :
                      order.report.status === "APPROVED" ? "blue" :
                      order.report.status === "SUBMITTED" ? "warning" :
                      "secondary"
                    }>
                      {order.report.status === "DRAFT" ? "Brouillon" :
                       order.report.status === "SUBMITTED" ? "Soumis" :
                       order.report.status === "APPROVED" ? "Approuvé" :
                       "Livré"}
                    </Badge>
                    {order.report.recommendation && (
                      <span className={`font-bold ${
                        order.report.recommendation === "ACHETER" ? "text-[#1A6B3A]" :
                        order.report.recommendation === "NEGOCIER" ? "text-amber-600" :
                        "text-red-600"
                      }`}>
                        {order.report.recommendation === "ACHETER" ? "✅ Acheter" :
                         order.report.recommendation === "NEGOCIER" ? "⚠️ Négocier" :
                         "❌ Éviter"}
                      </span>
                    )}
                  </div>
                  {order.report.inspectorNotes && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Notes inspecteur</p>
                      <p>{order.report.inspectorNotes}</p>
                    </div>
                  )}
                  {order.report.estimatedRepairMin && (
                    <p>
                      Coût rénovation estimé:{" "}
                      <strong>{formatMAD(order.report.estimatedRepairMin)} — {formatMAD(order.report.estimatedRepairMax || 0)}</strong>
                    </p>
                  )}
                  {order.report.estimatedMarketValue && (
                    <p>Valeur marché: <strong>{formatMAD(order.report.estimatedMarketValue)}</strong></p>
                  )}
                  {order.report.photos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">{order.report.photos.length} photos</p>
                      <div className="grid grid-cols-4 gap-2">
                        {order.report.photos.slice(0, 8).map((url, i) => (
                          <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                        ))}
                      </div>
                    </div>
                  )}
                  {order.report.pdfUrl && (
                    <a href={order.report.pdfUrl} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 mt-3 text-[#1A4A8A] hover:underline text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      Télécharger le rapport PDF
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cash confirmation logs */}
            {cashLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Journal paiement cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cashLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-gray-600">{formatDateTime(log.createdAt)}</span>
                        <Badge variant="secondary">{log.actorRole}</Badge>
                        <span>{log.event}: {log.amount} MAD</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Admin actions */}
          <div className="space-y-4">
            <AdminOrderActions
              order={{
                id: order.id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                paymentConfirmedByClient: order.paymentConfirmedByClient,
                paymentConfirmedByAdmin: order.paymentConfirmedByAdmin,
                inspectorId: order.inspectorId,
                reportId: order.report?.id,
                reportStatus: order.report?.status,
              }}
              availableInspectors={availableInspectors.map((p) => ({
                id: p.userId,
                name: p.user.name || "",
                badge: p.badge,
              }))}
            />

            {/* Financial summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Résumé financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix client</span>
                  <span className="font-medium">{formatMAD(order.clientPrice)}</span>
                </div>
                {order.creditApplied > 0 && (
                  <div className="flex justify-between text-[#1A6B3A]">
                    <span>Crédit appliqué</span>
                    <span>-{formatMAD(order.creditApplied)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Part inspecteur</span>
                  <span className="font-medium text-[#1A4A8A]">{formatMAD(order.inspectorShare || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-[#1A6B3A]">
                  <span>Marge plateforme</span>
                  <span>{formatMAD(order.margin || 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mode paiement</span>
                  <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Créée: {formatDateTime(order.createdAt)}
                </div>
                {order.deliveredAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-[#1A6B3A]" />
                    Livrée: {formatDateTime(order.deliveredAt)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
