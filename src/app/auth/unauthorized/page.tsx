import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldX className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
        <p className="text-gray-600 mb-6">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link href="/">
          <Button>Retour à l&apos;accueil</Button>
        </Link>
      </div>
    </div>
  );
}
