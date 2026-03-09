import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMAD(amount: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    ASSIGNED: "Assignée",
    IN_PROGRESS: "En cours",
    QUALITY_CHECK: "Contrôle qualité",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };
  return labels[status] || status;
}

export function getFormulaLabel(formula: string): string {
  const labels: Record<string, string> = {
    ESSENTIEL: "Essentiel",
    STANDARD: "Standard",
    PREMIUM: "Premium",
  };
  return labels[formula] || formula;
}

export function getFormulaPrice(formula: string): number {
  const prices: Record<string, number> = {
    ESSENTIEL: 1200,
    STANDARD: 2500,
    PREMIUM: 5000,
  };
  return prices[formula] || 0;
}

export function getFormulaInspectorShare(formula: string): number {
  const shares: Record<string, number> = {
    ESSENTIEL: 700,
    STANDARD: 1500,
    PREMIUM: 3000,
  };
  return shares[formula] || 0;
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    CARD: "Carte bancaire",
    WAFACASH: "Wafacash / Jibi",
    WIRE: "Virement bancaire",
    WESTERN_UNION: "Western Union",
  };
  return labels[method] || method;
}

export function getBadgeLabel(badge: string): string {
  const labels: Record<string, string> = {
    STARTER: "Starter",
    PRO: "Pro",
    EXPERT: "Expert",
  };
  return labels[badge] || badge;
}

export function getSubscriptionPrice(plan: string): number {
  const prices: Record<string, number> = {
    STARTER: 300,
    PRO: 600,
    EXPERT: 1000,
  };
  return prices[plan] || 0;
}

export function generateOrderNumber(id: string): string {
  return `IVM-${id.slice(-8).toUpperCase()}`;
}

export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kenitra",
  "Tétouan",
  "Safi",
  "Mohammedia",
  "El Jadida",
  "Beni Mellal",
  "Nador",
  "Settat",
  "Khouribga",
  "Berkane",
  "Taourirt",
  "Khemisset",
];

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "house", label: "Maison / Villa" },
  { value: "commercial", label: "Local commercial" },
  { value: "land", label: "Terrain" },
  { value: "riad", label: "Riad" },
];
