"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, MessageCircle } from "lucide-react";

export default function InspectorActions({
  inspectorId,
  isApproved,
  isActive,
  phone,
}: {
  inspectorId: string;
  isApproved: boolean;
  isActive: boolean;
  phone: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const doAction = async (action: string) => {
    setLoading(true);
    try {
      await fetch(`/api/admin/inspectors/${inspectorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 shrink-0">
      {!isApproved ? (
        <>
          <Button
            size="sm"
            variant="success"
            onClick={() => doAction("approve")}
            loading={loading}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approuver
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => doAction("reject")}
            loading={loading}
          >
            <XCircle className="h-4 w-4" />
            Rejeter
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant={isActive ? "destructive" : "success"}
          onClick={() => doAction(isActive ? "suspend" : "activate")}
          loading={loading}
        >
          {isActive ? "Suspendre" : "Réactiver"}
        </Button>
      )}
      {phone && (
        <a
          href={`https://wa.me/${phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </a>
      )}
    </div>
  );
}
