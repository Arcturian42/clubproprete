"use client";

import { ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { demoAccounts, areDemoAccountsEnabled } from "@/lib/auth-demo";

const showDemoAccounts = areDemoAccountsEnabled;

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState(showDemoAccounts ? demoAccounts[0].email : "");
  const [password, setPassword] = useState(showDemoAccounts ? "demo" : "");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedAccount = demoAccounts.find((account) => account.email === email);

  async function login(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    let safeCallbackUrl: string | null = null;
    if (callbackUrl?.startsWith("/")) {
      safeCallbackUrl = callbackUrl;
    } else if (callbackUrl) {
      try {
        const parsedCallback = new URL(callbackUrl);
        if (parsedCallback.origin === window.location.origin) {
          safeCallbackUrl = `${parsedCallback.pathname}${parsedCallback.search}`;
        }
      } catch {
        safeCallbackUrl = null;
      }
    }

    const isAdminRole = selectedAccount?.role === "admin" || selectedAccount?.role === "super_admin";
    router.push(safeCallbackUrl || (isAdminRole ? "/admin" : "/dashboard"));
    router.refresh();
  }

  return (
    <form
      onSubmit={login}
      className={showDemoAccounts ? "grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" : "mx-auto w-full max-w-md"}
    >
      <div className="surface p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <KeyRound size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Connexion</h2>
            <p className="text-sm font-semibold text-slate-500">
              {showDemoAccounts ? "Mot de passe : demo" : "Accédez à votre espace Club Propreté"}
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">
            {error}
            {/* U8 — Transforme l'impasse en chemin : lien d'aide secondaire. */}
            <span className="mt-1 block text-xs font-semibold normal-case text-red-600">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="underline hover:text-red-800">Créer un compte</Link>
            </span>
          </div>
        )}

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Email
          <input
            type="email"
            className="bento-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-label="Adresse email"
            autoComplete="email"
            required
          />
        </label>
        <label className="mt-4 grid gap-1.5 text-sm font-semibold text-slate-700">
          Mot de passe
          {/* U5 — Bascule afficher/masquer le mot de passe. */}
          <div className="relative">
            <input
              className="bento-input w-full pr-11"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label="Mot de passe"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[8px] p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bento-btn bento-btn-primary mt-5 w-full"
        >
          {loading ? "Connexion..." : "Se connecter"}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <div className="mt-3 text-center">
          <a href="/mot-de-passe-oublie" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      {showDemoAccounts && (
        <div className="surface p-6">
          <p className="text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">Comptes de test</p>
          <div className="mt-4 grid gap-3">
            {demoAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className={`bento-card bento-card-interactive p-4 text-left ${
                  account.email === email ? "bg-indigo-50" : "bg-white"
                }`}
                onClick={() => {
                  setEmail(account.email);
                  setPassword("demo");
                }}
              >
                <span className="block text-sm font-black text-slate-900">
                  {account.role === "candidate_profile"
                    ? "Compte démo candidat"
                    : `${account.firstName} ${account.lastName}`}
                </span>
                <span className="mt-1 block text-xs font-bold text-slate-500">
                  {account.email} · {account.profileType}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
