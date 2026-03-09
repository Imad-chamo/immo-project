"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PaymentConfirmActions({
  orderId,
  subscriptionId,
}: {
  orderId?: string;
  subscriptionId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const confirm = async (approved: boolean) => {
    setLoading(true);
    try {
      if (orderId) {
        await fetch(`/api/admin/orders/${orderId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: approved ? "confirm_payment" : "reject_payment" }),
        });
      } else if (subscriptionId) {
        await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmed: approved }),
        });
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="success" onClick={() => confirm(true)} loading={loading}>
        <CheckCircle2 className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="destructive" onClick={() => confirm(false)} loading={loading}>
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
