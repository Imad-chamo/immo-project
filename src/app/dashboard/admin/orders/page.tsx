import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMAD, formatDateTime, getOrderStatusLabel, getFormulaLabel, getPaymentMethodLabel } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "ASSIGNED", label: "Assignée" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "QUALITY_CHECK", label: "Contrôle qualité" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; city?: string; formula?: string; payment?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.city) where.propertyCity = { contains: params.city, mode: "insensitive" };
  if (params.formula) where.formula = params.formula;
  if (params.payment) where.paymentMethod = params.payment;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        client: { select: { name: true, email: true, phone: true } },
        inspector: { select: { name: true } },
        report: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard/admin" className="text-sm text-gray-500 hover:text-[#1A4A8A] mb-1 block">
              ← Tableau de bord
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
            <p className="text-gray-600 text-sm mt-1">{total} commande{total !== 1 ? "s" : ""} trouvée{total !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form className="flex flex-wrap gap-3">
              <select
                name="status"
                defaultValue={params.status || ""}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A4A8A]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                name="formula"
                defaultValue={params.formula || ""}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A4A8A]"
              >
                <option value="">Toutes formules</option>
                <option value="ESSENTIEL">Essentiel</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </select>
              <input
                name="city"
                defaultValue={params.city || ""}
                placeholder="Filtrer par ville..."
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A4A8A]"
              />
              <Button type="submit" size="sm">Filtrer</Button>
              <Link href="/dashboard/admin/orders">
                <Button variant="ghost" size="sm">Réinitialiser</Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        {/* Orders table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Commande</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Formule / Ville</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Paiement</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Montant</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Inspecteur</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: (typeof orders)[number]) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-[#1A4A8A] text-xs">
                      IVM-{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.client.name}</p>
                      <p className="text-xs text-gray-500">{order.client.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{getFormulaLabel(order.formula)}</Badge>
                      <p className="text-xs text-gray-500 mt-1">{order.propertyCity}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        order.status === "DELIVERED" ? "success" :
                        order.status === "QUALITY_CHECK" ? "blue" :
                        order.status === "IN_PROGRESS" ? "warning" :
                        order.status === "CANCELLED" ? "destructive" :
                        "secondary"
                      }>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <Badge variant={order.paymentStatus === "CONFIRMED" ? "success" : "warning"}>
                          {order.paymentStatus === "CONFIRMED" ? "Confirmé" : "En attente"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-0.5">{getPaymentMethodLabel(order.paymentMethod)}</p>
                        {order.paymentConfirmedByClient && order.paymentStatus === "PENDING" && (
                          <span className="text-xs text-red-600 font-medium">⚠ À valider</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatMAD(order.clientPrice)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {order.inspector?.name || (
                        <span className="text-amber-600 text-xs">Non assigné</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/admin/orders/${order.id}`}>
                        <Button size="sm" variant="outline">Gérer</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="p-8 text-center text-gray-500">Aucune commande trouvée</div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Page {page} sur {totalPages} ({total} résultats)
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/dashboard/admin/orders?page=${page - 1}${params.status ? `&status=${params.status}` : ""}`}>
                  <Button variant="outline" size="sm">Précédent</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/dashboard/admin/orders?page=${page + 1}${params.status ? `&status=${params.status}` : ""}`}>
                  <Button size="sm">Suivant</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
