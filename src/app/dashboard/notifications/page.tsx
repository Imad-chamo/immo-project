"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata: { link?: string } | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  ORDER_CONFIRMED: "✅",
  ORDER_ASSIGNED: "👤",
  REPORT_DELIVERED: "📄",
  PAYMENT_RECEIVED: "💰",
  PAYMENT_PENDING: "⏳",
  SUBSCRIPTION_ACTIVE: "⭐",
  SUBSCRIPTION_EXPIRING: "⚠️",
  GENERAL: "📢",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-1">
              <span className="font-semibold text-blue-700">{unreadCount}</span> non lue(s)
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? "En cours..." : "Tout marquer comme lu"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-16 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500 text-sm">
              Vous serez notifié ici lors des mises à jour de vos commandes et rapports.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border transition-all ${
                notif.read
                  ? "bg-white border-gray-100 shadow-sm"
                  : "bg-blue-50 border-blue-200 shadow-md"
              }`}
            >
              <div className="p-5 flex items-start gap-4">
                <div className="text-2xl flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[notif.type] || "📢"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-sm ${notif.read ? "text-gray-700" : "text-gray-900"}`}>
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                        >
                          Marquer lu
                        </button>
                      )}
                      {notif.read && (
                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-200">
                          Lu
                        </Badge>
                      )}
                    </div>
                  </div>
                  {notif.metadata?.link && (
                    <Link
                      href={notif.metadata.link}
                      className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-700 hover:text-blue-900"
                      onClick={() => !notif.read && markAsRead(notif.id)}
                    >
                      Voir les détails →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
