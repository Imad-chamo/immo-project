import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMAD } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "Assignée",
  IN_PROGRESS: "En cours",
  QUALITY_CHECK: "Contrôle qualité",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  QUALITY_CHECK: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const FORMULA_LABELS: Record<string, string> = {
  ESSENTIEL: "Essentiel",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export default async function InspectorMissionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.inspectorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) redirect("/dashboard/inspector/onboarding");

  const orders = await prisma.order.findMany({
    where: { inspectorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      report: { select: { id: true, status: true } },
    },
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o: (typeof orders)[number]) => ["ASSIGNED", "IN_PROGRESS"].includes(o.status)).length,
    pending_review: orders.filter((o: (typeof orders)[number]) => o.status === "QUALITY_CHECK").length,
    delivered: orders.filter((o: (typeof orders)[number]) => o.status === "DELIVERED").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes missions</h1>
          <p className="text-gray-600 mt-1">Toutes vos inspections assignées</p>
        </div>
        <Link href="/dashboard/inspector">
          <Button variant="outline" size="sm">← Tableau de bord</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Actives", value: stats.active, color: "text-blue-700" },
          { label: "En révision", value: stats.pending_review, color: "text-purple-700" },
          { label: "Livrées", value: stats.delivered, color: "text-green-700" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Missions list */}
      {orders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune mission pour l&apos;instant</h3>
            <p className="text-gray-500 text-sm">
              Les missions vous seront assignées par notre équipe selon votre disponibilité et vos villes d&apos;intervention.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {FORMULA_LABELS[order.formula] || order.formula}
                      </Badge>
                      {order.report && (
                        <Badge variant="outline" className="text-xs text-purple-700 border-purple-300">
                          Rapport: {order.report.status === "DRAFT" ? "Brouillon" : order.report.status === "SUBMITTED" ? "Soumis" : "Approuvé"}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {order.propertyType} — {order.propertyCity}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{order.propertyAddress}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <span>Client: {order.client.name}</span>
                      <span>•</span>
                      <span>
                        Commande: {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                      {order.scheduledDate && (
                        <>
                          <span>•</span>
                          <span className="text-blue-700 font-medium">
                            RDV: {new Date(order.scheduledDate).toLocaleDateString("fr-FR")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-700">
                        {formatMAD(order.inspectorShare || 0)}
                      </div>
                      <div className="text-xs text-gray-400">votre part</div>
                    </div>
                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                      <Link href={`/dashboard/inspector/missions/${order.id}`}>
                        <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-white">
                          {order.status === "ASSIGNED" ? "Démarrer" : "Continuer"}
                        </Button>
                      </Link>
                    )}
                    {order.status === "DELIVERED" && (
                      <Link href={`/dashboard/inspector/missions/${order.id}`}>
                        <Button size="sm" variant="outline">
                          Voir rapport
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
