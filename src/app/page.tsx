import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Star, MapPin, FileCheck, CheckCircle2, Clock,
  TrendingUp, Award, Users, Building2, ChevronRight, Quote,
} from "lucide-react";

const FORMULAS = [
  {
    id: "ESSENTIEL",
    name: "Essentiel",
    price: 1200,
    description: "Idéal pour un premier achat ou un budget maîtrisé",
    features: [
      "Visite de 2h sur site",
      "Rapport PDF structuré",
      "Photos commentées",
      "Évaluation des risques majeurs",
      "Recommandation achat",
    ],
    highlight: false,
  },
  {
    id: "STANDARD",
    name: "Standard",
    price: 2500,
    description: "La formule la plus populaire pour sécuriser votre achat",
    features: [
      "Visite de 3-4h approfondie",
      "Rapport PDF complet 20+ pages",
      "Photos HD + vidéo commentée",
      "Analyse structure & installations",
      "Estimation coûts de rénovation",
      "Estimation valeur marché",
      "Recommandation détaillée",
    ],
    highlight: true,
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 5000,
    description: "L'expertise complète pour les investissements importants",
    features: [
      "Visite de 5-6h exhaustive",
      "Rapport PDF expert 40+ pages",
      "Photos HD + vidéo drone",
      "Analyse thermique incluse",
      "Bilan énergétique",
      "Consultation notariale incluse",
      "Suivi négociation 30 jours",
      "Rapport de valorisation",
    ],
    highlight: false,
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: <FileCheck className="h-6 w-6" />,
    title: "Commandez en ligne",
    description: "Choisissez votre formule et renseignez l'adresse du bien. Paiement sécurisé en ligne ou par Wafacash.",
  },
  {
    step: 2,
    icon: <Users className="h-6 w-6" />,
    title: "On assigne un expert",
    description: "Dans les 24h, un ingénieur certifié disponible dans votre ville est assigné à votre mission.",
  },
  {
    step: 3,
    icon: <Building2 className="h-6 w-6" />,
    title: "Inspection sur site",
    description: "L'inspecteur visite le bien selon votre formule. Photos, vidéo, checklist technique complète.",
  },
  {
    step: 4,
    icon: <Shield className="h-6 w-6" />,
    title: "Contrôle qualité",
    description: "Notre équipe révise chaque rapport avant livraison. Aucun compromis sur la qualité.",
  },
  {
    step: 5,
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Rapport livré",
    description: "Vous recevez votre rapport PDF professionnel. Téléchargez-le et négociez en toute confiance.",
  },
];

const TESTIMONIALS = [
  {
    name: "Karim B.",
    city: "Casablanca",
    rating: 5,
    text: "J'ai évité une catastrophe ! L'inspecteur a trouvé des problèmes d'humidité cachés que le vendeur n'avait pas mentionnés. J'ai pu négocier 80 000 MAD de réduction.",
  },
  {
    name: "Yasmine M.",
    city: "Marrakech",
    rating: 5,
    text: "Service impeccable. Le rapport était très détaillé avec des photos claires. J'ai finalement décidé de ne pas acheter le bien, et je suis soulagée de l'avoir su avant.",
  },
  {
    name: "Hassan R.",
    city: "Rabat",
    rating: 5,
    text: "Excellent investissement. Grâce au rapport Premium, j'ai pu estimer les travaux et négocier un prix juste. L'inspecteur était professionnel et ponctuel.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#0f2d5a] via-[#1A4A8A] to-[#1e5499] text-white py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
                <Shield className="h-4 w-4 text-[#B8860B]" />
                <span>Plateforme indépendante &amp; certifiée</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Achetez au Maroc{" "}
                <span className="text-[#B8860B]">les yeux ouverts</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
                Avant de signer, faites inspecter votre futur bien par un ingénieur certifié.
                Rapport PDF professionnel livré en 48h. Structure, électricité, plomberie,
                humidité — rien n&apos;est laissé au hasard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/commander">
                  <Button size="xl" className="bg-[#B8860B] hover:bg-[#9a7209] text-white w-full sm:w-auto">
                    Commander une inspection
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/tarifs">
                  <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1A4A8A] w-full sm:w-auto">
                    Voir les tarifs
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
                {[
                  { value: "500+", label: "Inspections réalisées" },
                  { value: "12", label: "Villes couvertes" },
                  { value: "4.9/5", label: "Note moyenne" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-[#B8860B]">{stat.value}</div>
                    <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça fonctionne ?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Un processus simple et transparent, de la commande à la livraison de votre rapport.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {HOW_IT_WORKS.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-[#1A4A8A] rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
                      {step.icon}
                    </div>
                    <div className="w-6 h-6 bg-[#B8860B] rounded-full flex items-center justify-center text-white text-xs font-bold mb-3">
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ──────────────────────────────────────────────────── */}
        <section id="tarifs" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos formules d&apos;inspection</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choisissez la formule adaptée à votre bien et à vos enjeux financiers.
                Tous nos rapports sont validés avant livraison.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FORMULAS.map((formula) => (
                <Card
                  key={formula.id}
                  className={`relative overflow-hidden ${
                    formula.highlight
                      ? "border-[#1A4A8A] border-2 shadow-xl scale-105"
                      : "hover:shadow-lg transition-shadow"
                  }`}
                >
                  {formula.highlight && (
                    <div className="absolute top-0 left-0 right-0 bg-[#1A4A8A] text-white text-xs text-center py-1.5 font-medium">
                      LE PLUS POPULAIRE
                    </div>
                  )}
                  <CardContent className={`p-6 ${formula.highlight ? "pt-10" : ""}`}>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{formula.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{formula.description}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[#1A4A8A]">
                        {formula.price.toLocaleString("fr-MA")}
                      </span>
                      <span className="text-gray-500 ml-1">MAD</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {formula.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-[#1A6B3A] shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/commander?formula=${formula.id}`}>
                      <Button className="w-full" variant={formula.highlight ? "default" : "outline"}>
                        Commander — {formula.name}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">
              Paiement par carte bancaire, Wafacash, virement ou Western Union. Tous les prix incluent la TVA.
            </p>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ce que disent nos clients</h2>
              <div className="flex items-center justify-center gap-1 text-[#B8860B]">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                <span className="ml-2 text-gray-600 text-sm">4.9/5 basé sur 200+ avis</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-[#B8860B]/30 mb-4" />
                    <p className="text-gray-700 mb-4 leading-relaxed">{t.text}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{t.name}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />{t.city}
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-[#B8860B] fill-current" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST BADGES ─────────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: <Shield className="h-8 w-8" />, title: "Inspecteurs certifiés", desc: "Ingénieurs vérifiés par notre équipe" },
                { icon: <Clock className="h-8 w-8" />, title: "Livraison 48h", desc: "Rapport disponible sous 48 heures" },
                { icon: <Award className="h-8 w-8" />, title: "Qualité garantie", desc: "Chaque rapport relu et validé" },
                { icon: <TrendingUp className="h-8 w-8" />, title: "Indépendant", desc: "Aucun lien avec les agences" },
              ].map((b) => (
                <div key={b.title} className="flex flex-col items-center text-center">
                  <div className="text-[#1A4A8A] mb-3">{b.icon}</div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{b.title}</h3>
                  <p className="text-xs text-gray-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Questions fréquentes</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Qui sont vos inspecteurs ?",
                  a: "Tous nos inspecteurs sont des ingénieurs diplômés (génie civil, BTP) avec au minimum 3 ans d'expérience. Ils sont vérifiés par notre équipe et certifiés par Immo Verify Maroc avant de pouvoir accéder aux missions.",
                },
                {
                  q: "L'inspecteur est-il indépendant du vendeur ?",
                  a: "Absolument. Nos inspecteurs n'ont aucun lien avec les agences immobilières, promoteurs ou vendeurs. Ils travaillent exclusivement pour vous, l'acheteur.",
                },
                {
                  q: "Que se passe-t-il si l'inspecteur trouve des problèmes ?",
                  a: "Le rapport détaille tous les problèmes constatés avec photos et commentaires. Vous recevez aussi une estimation des coûts de rénovation et une recommandation : Acheter, Négocier ou Éviter.",
                },
                {
                  q: "Peut-on être présent lors de l'inspection ?",
                  a: "Oui, vous êtes encouragé à être présent (ou un représentant de votre choix). L'inspecteur vous expliquera ses observations sur place.",
                },
                {
                  q: "Comment payer si je suis à l'étranger ?",
                  a: "Vous pouvez payer par carte bancaire internationale (Visa, Mastercard via Stripe), Western Union, ou virement bancaire international.",
                },
              ].map((faq, index) => (
                <details key={index} className="group bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-medium text-gray-900 hover:bg-gray-50">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-90 shrink-0" />
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ──────────────────────────────────────────────────────── */}
        <section className="py-20 bg-[#1A4A8A] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à sécuriser votre achat ?</h2>
            <p className="text-blue-200 text-lg mb-8">
              Rejoignez plus de 500 acheteurs qui ont fait confiance à Immo Verify Maroc.
            </p>
            <Link href="/commander">
              <Button size="xl" className="bg-[#B8860B] hover:bg-[#9a7209] text-white">
                Commander mon inspection maintenant
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-blue-300 mt-4">Paiement sécurisé · Rapport en 48h · Satisfaction garantie</p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
