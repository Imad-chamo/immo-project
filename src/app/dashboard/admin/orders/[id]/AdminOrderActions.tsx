"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, UserCheck, FileCheck, Send } from "lucide-react";

interface Props {
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentConfirmedByClient: boolean;
    paymentConfirmedByAdmin: boolean;
    inspectorId: string | null;
    reportId: string | undefined;
    reportStatus: string | undefined;
  };
  availableInspectors: {
    id: string;
    name: string;
    badge: string;
  }[];
}

export default function AdminOrderActions({ order, availableInspectors }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState(order.inspectorId || "");
  const [adminNotes, setAdminNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const doAction = async (action: string, body?: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message || "Action effectuée");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">{error}</div>
        )}
        {success && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700 text-xs">{success}</div>
        )}

        {/* Payment confirmation */}
        {order.paymentStatus === "PENDING" && order.paymentMethod !== "CARD" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Paiement manuel</p>
            {order.paymentConfirmedByClient ? (
              <Badge variant="warning">Preuve soumise par client</Badge>
            ) : (
              <Badge variant="secondary">En attente du client</Badge>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="success"
                className="flex-1"
                loading={loading}
                onClick={() => doAction("confirm_payment")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirmer
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                loading={loading}
                onClick={() => doAction("reject_payment")}
              >
                <XCircle className="h-4 w-4" />
                Rejeter
              </Button>
            </div>
          </div>
        )}

        {/* Assign inspector */}
        {order.paymentStatus === "CONFIRMED" && order.status === "PENDING" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Assigner un inspecteur</p>
            {availableInspectors.length === 0 ? (
              <p className="text-xs text-amber-600">Aucun inspecteur disponible dans cette ville.</p>
            ) : (
              <>
                <Select value={selectedInspector} onValueChange={setSelectedInspector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un inspecteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInspectors.map((inspector) => (
                      <SelectItem key={inspector.id} value={inspector.id}>
                        {inspector.name} ({inspector.badge})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="w-full"
                  loading={loading}
                  disabled={!selectedInspector}
                  onClick={() => doAction("assign_inspector", { inspectorId: selectedInspector })}
                >
                  <UserCheck className="h-4 w-4" />
                  Assigner l&apos;inspecteur
                </Button>
              </>
            )}
          </div>
        )}

        {/* Approve report */}
        {order.reportStatus === "SUBMITTED" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Validation du rapport</p>
            <Textarea
              placeholder="Notes qualité (optionnel)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="text-xs"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="success"
                className="flex-1"
                loading={loading}
                onClick={() => doAction("approve_report", { adminNotes })}
              >
                <FileCheck className="h-4 w-4" />
                Approuver
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                loading={loading}
                onClick={() => doAction("reject_report", { adminNotes })}
              >
                <XCircle className="h-4 w-4" />
                Renvoyer
              </Button>
            </div>
          </div>
        )}

        {/* Generate and deliver PDF */}
        {order.reportStatus === "APPROVED" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Livraison</p>
            <Button
              size="sm"
              variant="success"
              className="w-full"
              loading={loading}
              onClick={() => doAction("generate_and_deliver")}
            >
              <Send className="h-4 w-4" />
              Générer PDF & Livrer au client
            </Button>
          </div>
        )}

        {/* Status change */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Changer le statut</p>
          <Select onValueChange={(val) => doAction("change_status", { status: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Nouveau statut..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="ASSIGNED">Assignée</SelectItem>
              <SelectItem value="IN_PROGRESS">En cours</SelectItem>
              <SelectItem value="QUALITY_CHECK">Contrôle qualité</SelectItem>
              <SelectItem value="DELIVERED">Livrée</SelectItem>
              <SelectItem value="CANCELLED">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
