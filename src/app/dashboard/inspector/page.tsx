import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Clock, CheckCircle2, Star, TrendingUp,
  AlertTriangle, FileText, Wallet,
} from "lucide-react";
import { formatMAD, formatDate, getOrderStatusLabel, getFormulaLabel } from "@/lib/utils";

export default async function InspectorDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "INSPECTOR") redirect("/auth/login");

  const profile = await prisma.inspectorProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!profile) redirect("/dashboard/inspector/onboarding");
  if (!profile.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profil en cours de validation</h2>
            <p className="text-gray-600">
              Notre équipe examine votre dossier. Vous serez notifié par email et WhatsApp
              dès que votre profil est approuvé (sous 24-48h).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [missions, notifications] = await Promise.all([
    prisma.order.findMany({
      where: { inspectorId: session.user.id },
      include: { report: { select: { status: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const activeMissions = missions.filter((m: (typeof missions)[number]) => ["ASSIGNED", "IN_PROGRESS"].includes(m.status));
  const completedMissions = missions.filter((m: (typeof missions)[number]) => m.status === "DELIVERED");
  const monthlyEarnings = completedMissions
    .filter((m: (typeof completedMissions)[number]) => {
      const d = new Date(m.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, m) => sum + (m.inspectorShare || 0), 0);

  const isSubscriptionActive = profile.subscriptionStatus === "ACTIVE";
  const subscriptionExpiresSoon =
    profile.subscriptionEnd &&
    new Date(profile.subscriptionEnd).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, {session.user.name?.split(" ")[0]} 👷
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isSubscriptionActive ? "success" : "destructive"}>
                {isSubscriptionActive ? "Abonnement actif" : "Abonnement expiré"}
              </Badge>
              <Badge variant="gold">{profile.badge}</Badge>
              {profile.rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-3 w-3 text-[#B8860B] fill-current" />
                  {profile.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <Link href="/dashboard/inspector/subscription">
            <Button variant={isSubscriptionActive ? "outline" : "default"}>
              {isSubscriptionActive ? "Gérer l'abonnement" : "Renouveler"}
            </Button>
          </Link>
        </div>

        {/* Alerts */}
        {!isSubscriptionActive && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Abonnement expiré</p>
              <p className="text-sm text-red-700">
                Renouvelez votre abonnement pour recevoir de nouvelles missions.
              </p>
              <Link href="/dashboard/inspector/subscription" className="inline-block mt-2">
                <Button size="sm" variant="destructive">Renouveler maintenant</Button>
              </Link>
            </div>
          </div>
        )}

        {subscriptionExpiresSoon && isSubscriptionActive && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Abonnement expire bientôt</p>
              <p className="text-sm text-amber-700">
                Votre abonnement expire le {formatDate(profile.subscriptionEnd!)}.
                Renouvelez pour ne pas perdre accès aux missions.
              </p>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((n: (typeof notifications)[number]) => (
              <div key={n.id} className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="w-2 h-2 bg-[#1A4A8A] rounded-full mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{n.title}</p>
                  <p className="text-sm text-blue-700">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1A4A8A]/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#1A4A8A]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeMissions.length}</p>
                  <p className="text-xs text-gray-500">Missions actives</p>
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
                  <p className="text-2xl font-bold">{profile.totalMissions}</p>
                  <p className="text-xs text-gray-500">Missions totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-[#B8860B]" />
                </div>
                <div>
                  <p className="text-xl font-bold">{formatMAD(monthlyEarnings)}</p>
                  <p className="text-xs text-gray-500">Ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.rating > 0 ? profile.rating.toFixed(1) : "—"}</p>
                  <p className="text-xs text-gray-500">Note moyenne</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active missions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Mes missions</CardTitle>
                <Link href="/dashboard/inspector/missions">
                  <Button variant="ghost" size="sm">Tout voir</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {missions.length === 0 ? (
                  <div className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {isSubscriptionActive
                        ? "Aucune mission pour l'instant. Assurez-vous que vos villes sont bien configurées."
                        : "Activez votre abonnement pour recevoir des missions."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {missions.slice(0, 6).map((mission: (typeof missions)[number]) => (
                      <Link key={mission.id} href={`/dashboard/inspector/missions/${mission.id}`}>
                        <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-bold text-[#1A4A8A]">
                                  IVM-{mission.id.slice(-8).toUpperCase()}
                                </span>
                                <Badge variant={
                                  mission.status === "DELIVERED" ? "success" :
                                  mission.status === "IN_PROGRESS" ? "warning" :
                                  "default"
                                }>
                                  {getOrderStatusLabel(mission.status)}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-gray-700">
                                {getFormulaLabel(mission.formula)}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3" />
                                {mission.propertyCity}
                                <span className="mx-1">·</span>
                                <Clock className="h-3 w-3" />
                                {formatDate(mission.createdAt)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#1A6B3A]">
                                {formatMAD(mission.inspectorShare || 0)}
                              </p>
                              <p className="text-xs text-gray-500">votre part</p>
                            </div>
                          </div>
                          {(mission.status === "ASSIGNED" || mission.status === "IN_PROGRESS") && (
                            <div className="mt-2 flex gap-2">
                              <Link
                                href={`/dashboard/inspector/missions/${mission.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button size="sm" variant="outline">
                                  {mission.status === "ASSIGNED" ? "Commencer la mission" : "Soumettre le rapport"}
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Subscription info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mon abonnement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <Badge variant="gold">{profile.badge}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut</span>
                  <Badge variant={isSubscriptionActive ? "success" : "destructive"}>
                    {isSubscriptionActive ? "Actif" : "Expiré"}
                  </Badge>
                </div>
                {profile.subscriptionEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expire le</span>
                    <span className="font-medium">{formatDate(profile.subscriptionEnd)}</span>
                  </div>
                )}
                <Link href="/dashboard/inspector/subscription" className="block">
                  <Button variant="outline" className="w-full">Gérer</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Cities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mes villes</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.cities.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aucune ville configurée.{" "}
                    <Link href="/dashboard/inspector/profile" className="text-[#1A4A8A] hover:underline">
                      Configurer
                    </Link>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.cities.map((city: string) => (
                      <span key={city} className="inline-flex items-center gap-1 bg-[#1A4A8A]/10 text-[#1A4A8A] text-xs px-2 py-1 rounded-full">
                        <MapPin className="h-3 w-3" />
                        {city}
                      </span>
                    ))}
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
