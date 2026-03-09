"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-[#0f2d5a] to-[#1A4A8A] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-blue-200 text-lg">
            Une question ? Besoin d&apos;un devis ? Notre équipe vous répond sous 2h.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              {
                icon: <MessageCircle className="h-5 w-5 text-green-600" />,
                label: "WhatsApp",
                value: "+212 6 00 00 00 00",
                href: "https://wa.me/212600000000",
                desc: "Réponse rapide",
              },
              {
                icon: <Mail className="h-5 w-5 text-[#1A4A8A]" />,
                label: "Email",
                value: "contact@immoverifymaroc.com",
                href: "mailto:contact@immoverifymaroc.com",
                desc: "Réponse sous 24h",
              },
              {
                icon: <Phone className="h-5 w-5 text-[#B8860B]" />,
                label: "Téléphone",
                value: "+212 5 00 00 00 00",
                href: "tel:+212500000000",
                desc: "Lun-Sam 9h-18h",
              },
            ].map((contact) => (
              <Card key={contact.label}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5">{contact.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500">{contact.label}</p>
                    <a href={contact.href} className="font-medium text-gray-900 hover:underline">
                      {contact.value}
                    </a>
                    <p className="text-xs text-gray-500">{contact.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#1A4A8A] mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Adresse</p>
                  <p className="font-medium text-gray-900">Casablanca, Maroc</p>
                  <p className="text-xs text-gray-500">Service national</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {sent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-[#1A6B3A]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                    <p className="text-gray-600">Notre équipe vous répondra sous 2h.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Votre nom"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      label="Sujet"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Question sur une inspection, tarif, partenariat..."
                      required
                    />
                    <Textarea
                      label="Message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Décrivez votre besoin..."
                      rows={5}
                      required
                    />
                    <Button type="submit" loading={loading} className="w-full" size="lg">
                      Envoyer le message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
