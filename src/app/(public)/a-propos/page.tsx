import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "À propos — Immo Verify Maroc",
  description:
    "Découvrez notre mission : rendre l'achat immobilier au Maroc transparent et sécurisé grâce à des inspections indépendantes réalisées par des ingénieurs certifiés.",
};

const values = [
  {
    icon: "🔍",
    title: "Indépendance totale",
    description:
      "Nous ne sommes ni agents immobiliers ni promoteurs. Notre seul client, c'est vous. Nos ingénieurs n'ont aucun intérêt commercial dans votre transaction.",
  },
  {
    icon: "📋",
    title: "Rigueur technique",
    description:
      "Chaque inspection suit un protocole de 150+ points de contrôle validé par des ingénieurs en génie civil. Aucun raccourci, aucun compromis.",
  },
  {
    icon: "🤝",
    title: "Transparence",
    description:
      "Nos rapports disent la vérité, même si elle est difficile à entendre. Nous préférons vous éviter une mauvaise décision plutôt que de vous plaire.",
  },
  {
    icon: "📱",
    title: "Accessibilité",
    description:
      "Service disponible dans toutes les grandes villes du Maroc. Notre plateforme digitale vous permet de commander, suivre et recevoir vos rapports en ligne.",
  },
];

const team = [
  {
    name: "Youssef El Alami",
    role: "Fondateur & Directeur",
    background: "Ingénieur en génie civil (EHTP), 12 ans dans l'immobilier",
    city: "Casablanca",
    initial: "Y",
  },
  {
    name: "Fatima Zahra Benali",
    role: "Responsable Qualité",
    background: "Ingénieure structure (EMI), ancienne experte BTP",
    city: "Rabat",
    initial: "F",
  },
  {
    name: "Karim Ouazzani",
    role: "Responsable Réseau Inspecteurs",
    background: "Architecte DPLG, 8 ans en maîtrise d'ouvrage",
    city: "Marrakech",
    initial: "K",
  },
];

const stats = [
  { value: "500+", label: "Inspections réalisées" },
  { value: "12", label: "Villes couvertes" },
  { value: "45", label: "Inspecteurs partenaires" },
  { value: "98%", label: "Clients satisfaits" },
];

const inspectorBenefits = [
  "Missions régulières selon votre ville et disponibilité",
  "Paiement garanti sous 48h après livraison du rapport",
  "Outils digitaux professionnels (app mobile, rapport automatisé)",
  "Formation continue et mise à jour des protocoles",
  "Badge de certification visible sur votre profil",
  "Communauté d'inspecteurs et partage d'expérience",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="bg-blue-500/30 text-blue-100 border-blue-400 mb-6 text-sm px-4 py-1">
            Notre histoire
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Achetez au Maroc
            <br />
            <span className="text-yellow-400">les yeux ouverts</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Immo Verify Maroc est née d&apos;un constat simple : au Maroc, l&apos;acheteur immobilier
            est seul face à des vendeurs motivés, sans expertise technique indépendante pour évaluer
            l&apos;état réel d&apos;un bien. Nous avons décidé de changer ça.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-blue-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Chaque année, des milliers de Marocains achètent des biens immobiliers avec des
                défauts cachés : fissures structurelles, problèmes d&apos;humidité, installations
                électriques défectueuses, canalisations vétustes. Le coût des réparations peut
                atteindre des centaines de milliers de dirhams.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Notre mission : démocratiser l&apos;accès à l&apos;expertise technique immobilière.
                Pour 1 200 à 5 000 MAD — une fraction infime du prix d&apos;un bien — vous obtenez
                un rapport complet rédigé par un ingénieur certifié qui vous dit exactement dans
                quoi vous investissez.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nous travaillons uniquement pour vous, pas pour les vendeurs ou les agents.
                Notre modèle économique repose sur vos honoraires d&apos;inspection, pas sur des
                commissions immobilières.
              </p>
            </div>
            <div className="space-y-4">
              {values.map((value) => (
                <Card key={value.title} className="border-0 shadow-sm">
                  <CardContent className="p-6 flex gap-4">
                    <div className="text-3xl flex-shrink-0">{value.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">L&apos;équipe fondatrice</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des professionnels de l&apos;immobilier et du génie civil, réunis par la conviction
              que l&apos;acheteur marocain mérite une protection technique sérieuse.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="text-center border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="w-20 h-20 rounded-full bg-blue-900 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {member.initial}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{member.name}</h3>
                  <p className="text-blue-700 font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{member.background}</p>
                  <Badge variant="outline" className="text-xs text-gray-500">
                    📍 {member.city}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Inspector Partnership */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 mb-6">
                Devenez inspecteur partenaire
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Vous êtes ingénieur ou architecte ?
              </h2>
              <p className="text-blue-200 leading-relaxed mb-6">
                Rejoignez notre réseau d&apos;inspecteurs certifiés et générez un revenu complémentaire
                significatif en réalisant des inspections immobilières dans votre ville.
                Notre plateforme gère tout : clients, planning, rapports, paiements.
              </p>
              <p className="text-blue-200 leading-relaxed mb-8">
                Un inspecteur actif réalise en moyenne 4 à 8 missions par mois pour un revenu
                supplémentaire de 4 000 à 12 000 MAD selon la formule et votre niveau d&apos;activité.
              </p>
              <Link href="/auth/register?role=inspector">
                <Button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold px-8 py-3">
                  Rejoindre le réseau
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {inspectorBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-blue-100 text-sm leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works for inspectors */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
          <p className="text-gray-600 mb-14 max-w-2xl mx-auto">
            Trois étapes simples pour rejoindre notre réseau et commencer à générer des revenus.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Créez votre profil",
                description:
                  "Inscrivez-vous, renseignez vos qualifications (diplôme, certifications), vos villes d'intervention et choisissez votre abonnement mensuel.",
              },
              {
                step: "2",
                title: "Recevez des missions",
                description:
                  "Notre équipe vous assigne des inspections selon votre disponibilité et votre zone géographique. Vous recevez une notification immédiate.",
              },
              {
                step: "3",
                title: "Rédigez et soyez payé",
                description:
                  "Réalisez l'inspection, remplissez le rapport sur notre app mobile, soumettez-le. Paiement garanti sous 48h après validation.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-14 h-14 rounded-full bg-blue-900 text-white text-xl font-bold flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à sécuriser votre investissement ?
          </h2>
          <p className="text-gray-600 mb-8">
            Commander une inspection prend moins de 5 minutes. Le rapport vous sera livré sous 48h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/commander">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 text-lg">
                Commander une inspection
              </Button>
            </Link>
            <Link href="/tarifs">
              <Button variant="outline" className="px-8 py-3 text-lg border-blue-900 text-blue-900">
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
