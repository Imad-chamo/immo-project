import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronRight } from "lucide-react";

const FORMULAS = [
  {
    id: "ESSENTIEL",
    name: "Essentiel",
    price: 1200,
    inspectorTime: "2h",
    delivery: "48h",
    color: "border-gray-200",
    description: "Pour un achat résidentiel avec un budget serré",
    features: [
      "Visite de 2h sur le terrain",
      "Checklist technique standard",
      "Rapport PDF structuré (15 pages)",
      "Photos commentées",
      "Évaluation des risques majeurs",
      "Recommandation achat: Acheter / Négocier / Éviter",
    ],
    notIncluded: [
      "Vidéo de la visite",
      "Estimation coûts de rénovation",
      "Estimation valeur marché",
    ],
  },
  {
    id: "STANDARD",
    name: "Standard",
    price: 2500,
    inspectorTime: "3-4h",
    delivery: "48h",
    color: "border-[#1A4A8A]",
    popular: true,
    description: "La formule complète pour sécuriser votre achat immobilier",
    features: [
      "Visite approfondie de 3-4h",
      "Checklist technique complète",
      "Rapport PDF professionnel (20+ pages)",
      "Photos HD commentées",
      "Vidéo de la visite",
      "Analyse structure, électricité, plomberie, humidité",
      "Estimation fourchette coûts de rénovation",
      "Estimation valeur marché",
      "Recommandation détaillée",
    ],
    notIncluded: [
      "Analyse thermique",
      "Bilan énergétique",
      "Suivi négociation",
    ],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 5000,
    inspectorTime: "5-6h",
    delivery: "72h",
    color: "border-[#B8860B]",
    description: "L'expertise complète pour les investissements importants",
    features: [
      "Visite exhaustive de 5-6h",
      "Rapport expert 40+ pages",
      "Photos HD + vidéo drone",
      "Analyse thermique par infrarouge",
      "Bilan énergétique",
      "Consultation juridique incluse",
      "Estimation de valorisation",
      "Suivi de négociation 30 jours",
      "Accès expert pour questions",
    ],
    notIncluded: [],
  },
];

export default function TarifsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-[#0f2d5a] to-[#1A4A8A] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Nos tarifs d&apos;inspection</h1>
          <p className="text-xl text-blue-200">
            Transparents, tout inclus, sans surprise.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FORMULAS.map((formula) => (
            <Card
              key={formula.id}
              id={formula.id.toLowerCase()}
              className={`relative overflow-hidden border-2 ${formula.color} ${formula.popular ? "shadow-2xl scale-105" : "hover:shadow-lg"} transition-all`}
            >
              {formula.popular && (
                <div className="bg-[#1A4A8A] text-white text-xs text-center py-2 font-semibold">
                  LE PLUS CHOISI
                </div>
              )}
              <CardContent className={`p-6 ${formula.popular ? "pt-4" : ""}`}>
                <h2 className="text-2xl font-bold text-gray-900">{formula.name}</h2>
                <p className="text-gray-500 text-sm mt-1 mb-4">{formula.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-[#1A4A8A]">
                    {formula.price.toLocaleString("fr-MA")}
                  </span>
                  <span className="text-gray-500"> MAD</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 mb-6">
                  <span>⏱ {formula.inspectorTime} sur site</span>
                  <span>📋 Livraison {formula.delivery}</span>
                </div>

                <div className="space-y-2 mb-6">
                  {formula.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[#1A6B3A] mt-0.5 shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </div>
                  ))}
                  {formula.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm opacity-40">
                      <div className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-3 h-0.5 bg-gray-400 rounded" />
                      </div>
                      <span className="text-gray-500">{f}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/commander?formula=${formula.id}`}>
                  <Button
                    className="w-full"
                    variant={formula.popular ? "default" : "outline"}
                    size="lg"
                  >
                    Commander {formula.name}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ce qui est toujours inclus</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>✅ Rapport signé par un ingénieur certifié</div>
            <div>✅ Contrôle qualité par notre équipe</div>
            <div>✅ Livraison par email + téléchargement</div>
            <div>✅ Paiement sécurisé multi-méthodes</div>
            <div>✅ Indépendance totale du vendeur/agence</div>
            <div>✅ Support client 7j/7</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Besoin d&apos;une formule sur mesure pour un projet commercial ou d&apos;investissement ?
          </p>
          <Link href="/contact">
            <Button variant="outline">Nous contacter pour un devis</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
