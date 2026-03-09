import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Users, FileText, Clock, CheckCircle2,
  AlertTriangle, DollarSign, Star, ArrowRight, Package,
} from "lucide-react";
import { formatMAD, formatDateTime, getOrderStatusLabel, getFormulaLabel } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  const [
    totalOrders,
    todayOrders,
    monthOrders,
    pendingOrders,
    activeInspectors,
    pendingPayments,
    pendingReports,
    recentOrders,
    monthRevenue,
    subscriptionRevenue,
  ] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: "CONFIRMED" } }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay }, paymentStatus: "CONFIRMED" } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth }, paymentStatus: "CONFIRMED" } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "ASSIGNED"] } } }),
    prisma.inspectorProfile.count({ where: { isApproved: true, subscriptionStatus: "ACTIVE" } }),
    prisma.order.count({ where: { paymentStatus: "PENDING", paymentConfirmedByClient: true } }),
    prisma.report.count({ where: { status: "SUBMITTED" } }),
    prisma.order.findMany({
      include: {
        client: { select: { name: true } },
        inspector: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth }, paymentStatus: "CONFIRMED" },
      _sum: { clientPrice: true },
    }),
    prisma.subscription.aggregate({
      where: { createdAt: { gte: startOfMonth }, confirmedByAdmin: true },
      _sum: { price: true },
    }),
  ]);

  const totalMonthRevenue =
    (monthRevenue._sum.clientPrice || 0) + (subscriptionRevenue._sum.price || 0);

  const kpis = [
    {
      label: "Revenus aujourd&apos;hui",
      value: formatMAD(todayOrders * 2000),
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-green-50 text-[#1A6B3A]",
      link: "/dashboard/admin/orders",
    },
    {
      label: "Revenus ce mois",
      value: formatMAD(totalMonthRevenue),
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-blue-50 text-[#1A4A8A]",
      link: "/dashboard/admin/analytics",
    },
    {
      label: "Commandes actives",
      value: pendingOrders,
      icon: <Package className="h-5 w-5" />,
      color: "bg-amber-50 text-amber-700",
      link: "/dashboard/admin/orders",
    },
    {
      label: "Inspecteurs actifs",
      value: activeInspectors,
      icon: <Users className="h-5 w-5" />,
      color: "bg-purple-50 text-purple-700",
      link: "/dashboard/admin/inspectors",
    },
    {
      label: "Paiements à valider",
      value: pendingPayments,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: pendingPayments > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-500",
      link: "/dashboard/admin/payments",
      urgent: pendingPayments > 0,
    },
    {
      label: "Rapports à réviser",
      value: pendingReports,
      icon: <FileText className="h-5 w-5" />,
      color: pendingReports > 0 ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-500",
      link: "/dashboard/admin/orders?status=QUALITY_CHECK",
      urgent: pendingReports > 0,
    },
    {
      label: "Total inspections",
      value: totalOrders,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "bg-teal-50 text-teal-700",
      link: "/dashboard/admin/orders",
    },
    {
      label: "Commandes ce mois",
      value: monthOrders,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-indigo-50 text-indigo-700",
      link: "/dashboard/admin/analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
            <p className="text-gray-600 mt-1">Bienvenue, {session.user.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/admin/orders">
              <Button variant="outline" size="sm">Commandes</Button>
            </Link>
            <Link href="/dashboard/admin/inspectors">
              <Button variant="outline" size="sm">Inspecteurs</Button>
            </Link>
          </div>
        </div>

        {/* Urgent alerts */}
        {(pendingPayments > 0 || pendingReports > 0) && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPayments > 0 && (
              <Link href="/dashboard/admin/payments">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                  <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">
                      {pendingPayments} paiement{pendingPayments > 1 ? "s" : ""} à confirmer
                    </p>
                    <p className="text-sm text-red-700">Clients en attente de validation</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-red-600 ml-auto" />
                </div>
              </Link>
            )}
            {pendingReports > 0 && (
              <Link href="/dashboard/admin/orders?status=QUALITY_CHECK">
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors cursor-pointer">
                  <FileText className="h-6 w-6 text-orange-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-orange-900">
                      {pendingReports} rapport{pendingReports > 1 ? "s" : ""} à valider
                    </p>
                    <p className="text-sm text-orange-700">Contrôle qualité requis</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-600 ml-auto" />
                </div>
              </Link>
            )}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => (
            <Link key={kpi.label} href={kpi.link}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${kpi.urgent ? "ring-2 ring-red-300" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${kpi.color}`}>
                      {kpi.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-gray-500"
                         dangerouslySetInnerHTML={{ __html: kpi.label }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Commandes récentes</CardTitle>
            <Link href="/dashboard/admin/orders">
              <Button variant="ghost" size="sm">
                Tout voir <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Commande</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Client</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Formule</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Montant</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-[#1A4A8A]">
                        IVM-{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{order.client.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{getFormulaLabel(order.formula)}</Badge>
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
                      <td className="px-4 py-3 font-medium">{formatMAD(order.clientPrice)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDateTime(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/admin/orders/${order.id}`}>
                          <Button size="sm" variant="ghost">Voir</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { href: "/dashboard/admin/orders", label: "Gestion commandes", icon: <Package className="h-5 w-5" /> },
            { href: "/dashboard/admin/inspectors", label: "Inspecteurs", icon: <Users className="h-5 w-5" /> },
            { href: "/dashboard/admin/payments", label: "Paiements", icon: <DollarSign className="h-5 w-5" /> },
            { href: "/dashboard/admin/analytics", label: "Analytics", icon: <TrendingUp className="h-5 w-5" /> },
          ].map((nav) => (
            <Link key={nav.href} href={nav.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-[#1A4A8A]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="text-[#1A4A8A]">{nav.icon}</div>
                  <span className="font-medium text-gray-800 text-sm">{nav.label}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
