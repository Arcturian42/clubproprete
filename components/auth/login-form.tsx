"use client";

import { ArrowRight, KeyRound } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { demoAccounts } from "@/lib/auth-demo";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState(demoAccounts[0].email);
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedAccount = demoAccounts.find((account) => account.email === email) ?? demoAccounts[0];

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

    const isAdminRole = selectedAccount.role === "admin" || selectedAccount.role === "super_admin";
    router.push(safeCallbackUrl || (isAdminRole ? "/admin" : "/dashboard"));
    router.refresh();
  }

  return (
    <form onSubmit={login} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="surface p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-[14px] border-2 border-slate-900 bg-indigo-600 p-3 text-white shadow-[3px_3px_0px_#0f172a]">
            <KeyRound size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Connexion</h2>
            <p className="text-sm font-semibold text-slate-500">Mot de passe : demo</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-[14px] border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
          Email
          <input
            type="email"
            className="bento-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-label="Adresse email"
            required
          />
        </label>
        <label className="mt-4 grid gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
          Mot de passe
          <input
            className="bento-input"
            placeholder="demo"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-label="Mot de passe"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bento-btn bento-btn-primary mt-5 w-full"
        >
          {loading ? "Connexion..." : "Se connecter"}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>

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
                {account.firstName} {account.lastName}
              </span>
              <span className="mt-1 block text-xs font-bold text-slate-500">
                {account.email} · {account.profileType}
              </span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
