"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "inspector" ? "INSPECTOR" : "CLIENT";
  const referralCode = searchParams.get("ref") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: defaultRole,
    referralCode,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      // Auto login
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push(form.role === "INSPECTOR" ? "/dashboard/inspector/onboarding" : "/dashboard/client");
    } catch {
      setError("Erreur serveur");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1A4A8A] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">IV</span>
            </div>
            <span className="font-bold text-[#1A4A8A] text-xl">
              Immo Verify <span className="text-[#B8860B]">Maroc</span>
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>
              {form.role === "INSPECTOR"
                ? "Rejoignez notre réseau d'inspecteurs partenaires"
                : "Commandez votre première inspection"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "CLIENT" })}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${
                  form.role === "CLIENT"
                    ? "bg-white text-[#1A4A8A] shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Je suis client
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "INSPECTOR" })}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${
                  form.role === "INSPECTOR"
                    ? "bg-white text-[#1A4A8A] shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Je suis inspecteur
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nom complet"
                placeholder="Mohamed Alaoui"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Téléphone"
                type="tel"
                placeholder="+212 6XX XXX XXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                label="Mot de passe"
                type="password"
                placeholder="8 caractères minimum"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
              {referralCode && (
                <Input
                  label="Code de parrainage"
                  value={form.referralCode}
                  onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
                  helperText="Vous bénéficiez d'un code de parrainage"
                />
              )}
              <Button type="submit" className="w-full" loading={loading}>
                Créer mon compte
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-[#1A4A8A] font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
