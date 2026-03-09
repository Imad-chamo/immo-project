import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMAD, formatDateTime, getPaymentMethodLabel, getFormulaLabel } from "@/lib/utils";
import PaymentConfirmActions from "./PaymentConfirmActions";

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const [pendingPayments, recentSubscriptions, inspectorPayouts] = await Promise.all([
    prisma.order.findMany({
      where: {
        paymentStatus: "PENDING",
        paymentMethod: { not: "CARD" },
      },
      include: {
        client: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findMany({
      where: { confirmedByAdmin: false, paymentMethod: { not: "CARD" } },
      include: {
        inspector: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { status: "DELIVERED", paymentStatus: "CONFIRMED" },
      include: {
        inspector: { select: { name: true } },
      },
      orderBy: { deliveredAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard/admin" className="text-sm text-gray-500 hover:text-[#1A4A8A] mb-1 block">
            ← Tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements</h1>
        </div>

        <div className="space-y-8">
          {/* Pending order payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Paiements commandes à confirmer
                {pendingPayments.length > 0 && (
                  <Badge variant="destructive">{pendingPayments.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendingPayments.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm">Aucun paiement en attente</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500">Commande</th>
                      <th className="text-left px-4 py-3 text-gray-500">Client</th>
                      <th className="text-left px-4 py-3 text-gray-500">Formule</th>
                      <th className="text-left px-4 py-3 text-gray-500">Méthode</th>
                      <th className="text-left px-4 py-3 text-gray-500">Montant déclaré</th>
                      <th className="text-left px-4 py-3 text-gray-500">Preuve</th>
                      <th className="text-left px-4 py-3 text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingPayments.map((order: (typeof pendingPayments)[number]) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-[#1A4A8A] font-bold text-xs">
                          IVM-{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.client.name}</p>
                          <p className="text-xs text-gray-500">{order.client.email}</p>
                        </td>
                        <td className="px-4 py-3">{getFormulaLabel(order.formula)}</td>
                        <td className="px-4 py-3">{getPaymentMethodLabel(order.paymentMethod)}</td>
                        <td className="px-4 py-3 font-medium">
                          {order.paymentAmountPaid ? formatMAD(order.paymentAmountPaid) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {order.paymentProofUrl ? (
                            <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                               className="text-[#1A4A8A] hover:underline text-xs">
                              Voir le reçu
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">Non soumis</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <PaymentConfirmActions orderId={order.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Pending subscriptions */}
          {recentSubscriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Abonnements à confirmer ({recentSubscriptions.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500">Inspecteur</th>
                      <th className="text-left px-4 py-3 text-gray-500">Plan</th>
                      <th className="text-left px-4 py-3 text-gray-500">Montant</th>
                      <th className="text-left px-4 py-3 text-gray-500">Méthode</th>
                      <th className="text-left px-4 py-3 text-gray-500">Date</th>
                      <th className="text-left px-4 py-3 text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentSubscriptions.map((sub: (typeof recentSubscriptions)[number]) => (
                      <tr key={sub.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{sub.inspector.user.name}</p>
                          <p className="text-xs text-gray-500">{sub.inspector.user.email}</p>
                        </td>
                        <td className="px-4 py-3"><Badge variant="gold">{sub.plan}</Badge></td>
                        <td className="px-4 py-3 font-medium">{formatMAD(sub.price)}</td>
                        <td className="px-4 py-3">{getPaymentMethodLabel(sub.paymentMethod)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDateTime(sub.createdAt)}</td>
                        <td className="px-4 py-3">
                          <PaymentConfirmActions subscriptionId={sub.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Inspector payouts */}
          <Card>
            <CardHeader>
              <CardTitle>Paiements inspecteurs (missions livrées)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500">Commande</th>
                    <th className="text-left px-4 py-3 text-gray-500">Inspecteur</th>
                    <th className="text-left px-4 py-3 text-gray-500">Part inspecteur</th>
                    <th className="text-left px-4 py-3 text-gray-500">Livré le</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inspectorPayouts.map((order: (typeof inspectorPayouts)[number]) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-mono text-[#1A4A8A] text-xs font-bold">
                        IVM-{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">{order.inspector?.name || "—"}</td>
                      <td className="px-4 py-3 font-medium text-[#1A6B3A]">
                        {formatMAD(order.inspectorShare || 0)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {order.deliveredAt ? formatDateTime(order.deliveredAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
