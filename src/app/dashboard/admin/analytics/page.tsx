import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMAD } from "@/lib/utils";
import RevenueChart from "./RevenueChart";

type CityRow = { propertyCity: string; _count: number; _sum: { clientPrice: number | null } };

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  // Revenue by month (last 12 months)
  const now = new Date();
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const [orderRevenue, subRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: start, lte: end }, paymentStatus: "CONFIRMED" },
        _sum: { clientPrice: true, margin: true },
        _count: true,
      }),
      prisma.subscription.aggregate({
        where: { createdAt: { gte: start, lte: end }, confirmedByAdmin: true },
        _sum: { price: true },
      }),
    ]);

    monthlyData.push({
      month: d.toLocaleDateString("fr-MA", { month: "short", year: "2-digit" }),
      inspections: orderRevenue._sum.clientPrice || 0,
      subscriptions: subRevenue._sum.price || 0,
      margin: orderRevenue._sum.margin || 0,
      count: orderRevenue._count,
    });
  }

  // Top cities
  const ordersByCity = await prisma.order.groupBy({
    by: ["propertyCity"],
    where: { paymentStatus: "CONFIRMED" },
    _count: true,
    _sum: { clientPrice: true },
    orderBy: { _count: { propertyCity: "desc" } },
    take: 10,
  });

  // Top inspectors
  const topInspectors = await prisma.inspectorProfile.findMany({
    where: { totalMissions: { gt: 0 } },
    orderBy: [{ totalMissions: "desc" }, { rating: "desc" }],
    take: 10,
    include: { user: { select: { name: true } } },
  });

  // By formula
  const byFormula = await prisma.order.groupBy({
    by: ["formula"],
    where: { paymentStatus: "CONFIRMED" },
    _count: true,
    _sum: { clientPrice: true },
  });

  const totalRevenue = monthlyData.reduce((s, m) => s + m.inspections, 0);
  const totalSubRevenue = monthlyData.reduce((s, m) => s + m.subscriptions, 0);
  const totalMargin = monthlyData.reduce((s, m) => s + m.margin, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard/admin" className="text-sm text-gray-500 hover:text-[#1A4A8A] mb-1 block">
            ← Tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Revenus</h1>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">Revenus inspections (12 mois)</p>
              <p className="text-3xl font-bold text-[#1A4A8A] mt-1">{formatMAD(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">Revenus abonnements (12 mois)</p>
              <p className="text-3xl font-bold text-[#B8860B] mt-1">{formatMAD(totalSubRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">Marge nette plateforme (12 mois)</p>
              <p className="text-3xl font-bold text-[#1A6B3A] mt-1">{formatMAD(totalMargin)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Évolution des revenus (12 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={monthlyData} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* By city */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top villes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(ordersByCity as CityRow[]).map((city, i) => (
                  <div key={city.propertyCity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1A4A8A] text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">{city.propertyCity}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{city._count} commandes</p>
                      <p className="text-xs text-gray-500">{formatMAD(city._sum.clientPrice || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By formula */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Par formule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {byFormula.map((f) => {
                  const total = byFormula.reduce((s, x) => s + x._count, 0);
                  const pct = total > 0 ? Math.round((f._count / total) * 100) : 0;
                  const colors: Record<string, string> = {
                    ESSENTIEL: "bg-blue-400",
                    STANDARD: "bg-[#1A4A8A]",
                    PREMIUM: "bg-[#B8860B]",
                  };
                  return (
                    <div key={f.formula}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{f.formula}</span>
                        <span className="text-gray-600">{f._count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[f.formula] || "bg-gray-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{formatMAD(f._sum.clientPrice || 0)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top inspectors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top inspecteurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topInspectors.map((inspector, i) => (
                  <div key={inspector.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#B8860B] text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{inspector.user.name}</p>
                        <p className="text-xs text-gray-500">{inspector.badge}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{inspector.totalMissions} missions</p>
                      <p className="text-xs text-gray-500">
                        {inspector.rating > 0 ? `⭐ ${inspector.rating.toFixed(1)}` : "Pas de note"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
