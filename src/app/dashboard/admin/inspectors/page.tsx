import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import InspectorActions from "./InspectorActions";

export default async function AdminInspectorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.status === "pending") where.isApproved = false;
  else if (params.status === "active") where.isApproved = true;

  const profiles = await prisma.inspectorProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = profiles.filter((p: (typeof profiles)[number]) => !p.isApproved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard/admin" className="text-sm text-gray-500 hover:text-[#1A4A8A] mb-1 block">
              ← Tableau de bord
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des inspecteurs</h1>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive">{pendingCount} en attente d&apos;approbation</Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Link href="/dashboard/admin/inspectors">
            <Button variant={!params.status ? "default" : "outline"} size="sm">Tous ({profiles.length})</Button>
          </Link>
          <Link href="/dashboard/admin/inspectors?status=pending">
            <Button variant={params.status === "pending" ? "default" : "outline"} size="sm">
              En attente ({pendingCount})
            </Button>
          </Link>
          <Link href="/dashboard/admin/inspectors?status=active">
            <Button variant={params.status === "active" ? "default" : "outline"} size="sm">
              Actifs ({profiles.filter((p: (typeof profiles)[number]) => p.isApproved).length})
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {profiles.map((profile) => (
            <Card key={profile.id} className={!profile.isApproved ? "border-amber-200 bg-amber-50" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#1A4A8A] rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {profile.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">{profile.user.name}</p>
                        <Badge variant={profile.isApproved ? "success" : "warning"}>
                          {profile.isApproved ? "Approuvé" : "En attente"}
                        </Badge>
                        <Badge variant="gold">{profile.badge}</Badge>
                        <Badge variant={profile.subscriptionStatus === "ACTIVE" ? "success" : "destructive"}>
                          Abonnement: {profile.subscriptionStatus === "ACTIVE" ? "Actif" : "Expiré"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{profile.user.email}</p>
                      {profile.user.phone && <p className="text-sm text-gray-600">{profile.user.phone}</p>}

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-[#1A6B3A]" />
                          {profile.totalMissions} missions
                        </span>
                        {profile.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-[#B8860B] fill-current" />
                            {profile.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Inscrit le {formatDate(profile.user.createdAt)}
                        </span>
                      </div>

                      {profile.cities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {profile.cities.map((city) => (
                            <span key={city} className="inline-flex items-center gap-1 bg-[#1A4A8A]/10 text-[#1A4A8A] text-xs px-2 py-0.5 rounded-full">
                              <MapPin className="h-2.5 w-2.5" />
                              {city}
                            </span>
                          ))}
                        </div>
                      )}

                      {!profile.isApproved && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Profil en attente de validation admin
                        </div>
                      )}
                    </div>
                  </div>

                  <InspectorActions
                    inspectorId={profile.userId}
                    isApproved={profile.isApproved}
                    isActive={profile.isActive}
                    phone={profile.user.phone}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {profiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun inspecteur trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
