import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, FileText, Clock, CheckCircle2, Star, Share2, Copy,
  Download, MapPin, Building2,
} from "lucide-react";
import { formatMAD, formatDate, getOrderStatusLabel, getFormulaLabel } from "@/lib/utils";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "DELIVERED": return "success";
    case "QUALITY_CHECK": return "blue";
    case "IN_PROGRESS": return "warning";
    case "ASSIGNED": return "default";
    case "CANCELLED": return "destructive";
    default: return "secondary";
  }
}

export default async function ClientDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/auth/login");

  const [orders, credits, notifications] = await Promise.all([
    prisma.order.findMany({
      where: { clientId: session.user.id },
      include: {
        inspector: { select: { name: true, image: true } },
        report: { select: { status: true, pdfUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.referralCredit.findMany({
      where: { userId: session.user.id, usedOnOrderId: null },
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true, name: true },
  });

  const totalCredits = credits.reduce((sum: number, c: (typeof credits)[number]) => sum + c.amount, 0);
  const deliveredOrders = orders.filter((o: (typeof orders)[number]) => o.status === "DELIVERED").length;
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?ref=${user?.referralCode}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, {session.user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-600 mt-1">Suivez vos inspections en temps réel</p>
          </div>
          <Link href="/commander">
            <Button>
              <Plus className="h-4 w-4" />
              Nouvelle inspection
            </Button>
          </Link>
        </div>

        {/* Unread notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((notif: (typeof notifications)[number]) => (
              <div key={notif.id} className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="w-2 h-2 bg-[#1A4A8A] rounded-full mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{notif.title}</p>
                  <p className="text-sm text-blue-700">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1A4A8A]/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#1A4A8A]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-xs text-gray-500">Commandes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-[#1A6B3A]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
                  <p className="text-xs text-gray-500">Livrées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#B8860B]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatMAD(totalCredits)}</p>
                  <p className="text-xs text-gray-500">Crédits parrainage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">400 MAD</p>
                  <p className="text-xs text-gray-500">Par parrainage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mes commandes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Aucune commande pour l&apos;instant</p>
                    <Link href="/commander">
                      <Button variant="outline">Commander ma première inspection</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.map((order: (typeof orders)[number]) => (
                      <Link key={order.id} href={`/dashboard/client/orders/${order.id}`}>
                        <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-bold text-[#1A4A8A]">
                                  IVM-{order.id.slice(-8).toUpperCase()}
                                </span>
                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                  {getOrderStatusLabel(order.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 font-medium truncate">
                                {getFormulaLabel(order.formula)} — {order.propertyType}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3" />
                                {order.propertyCity}
                                <span className="mx-1">·</span>
                                <Clock className="h-3 w-3" />
                                {formatDate(order.createdAt)}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-gray-900">{formatMAD(order.clientPrice)}</p>
                              {order.status === "DELIVERED" && order.report?.pdfUrl && (
                                <a
                                  href={order.report.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-xs text-[#1A6B3A] hover:underline mt-1"
                                >
                                  <Download className="h-3 w-3" />
                                  Rapport
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Status timeline indicator */}
                          <div className="mt-3">
                            <div className="flex items-center gap-1">
                              {["PENDING", "ASSIGNED", "IN_PROGRESS", "QUALITY_CHECK", "DELIVERED"].map((s, i) => {
                                const statuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "QUALITY_CHECK", "DELIVERED"];
                                const currentIdx = statuses.indexOf(order.status);
                                const isActive = i <= currentIdx;
                                return (
                                  <div
                                    key={s}
                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                      isActive ? "bg-[#1A4A8A]" : "bg-gray-200"
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Referral panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-purple-500" />
                  Programme de parrainage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Parrainez un ami et recevez <strong className="text-[#1A4A8A]">400 MAD de crédit</strong> dès sa première inspection.
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Votre lien de parrainage</p>
                  <p className="text-sm font-mono text-gray-800 truncate">{referralLink}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => {}}
                >
                  <Copy className="h-4 w-4" />
                  Copier le lien
                </Button>
                {totalCredits > 0 && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-sm font-bold text-[#1A6B3A]">{formatMAD(totalCredits)} de crédits disponibles</p>
                    <p className="text-xs text-gray-500">Appliqués automatiquement à votre prochaine commande</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Besoin d&apos;aide ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://wa.me/212600000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-700 hover:underline"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contacter le support WhatsApp
                </a>
                <Link href="/contact" className="block text-sm text-[#1A4A8A] hover:underline">
                  Formulaire de contact
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
