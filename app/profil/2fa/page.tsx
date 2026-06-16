"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getTwoFactorSetup, confirmTwoFactorSetup, disableTwoFactor } from "@/lib/actions/two-factor";
import { Shield, ShieldCheck, ShieldOff, Copy, Check, ArrowLeft } from "lucide-react";

export default function TwoFactorPage() {
  const [status, setStatus] = useState<"loading" | "setup" | "enabled" | "disabled">("loading");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getTwoFactorSetup().then((res) => {
      if (!res.success) {
        setMessage(res.message || "Erreur");
        setStatus("disabled");
        return;
      }
      if (res.enabled) {
        setStatus("enabled");
      } else {
        setStatus("setup");
        setSecret(res.secret || "");
        setUri(res.uri || "");
      }
    });
  }, []);

  async function handleConfirm() {
    setMessage("");
    const res = await confirmTwoFactorSetup(secret, code);
    if (res.success) {
      setStatus("enabled");
      setCode("");
    }
    setMessage(res.message || "");
  }

  async function handleDisable() {
    setMessage("");
    const res = await disableTwoFactor(code);
    if (res.success) {
      setStatus("disabled");
      setCode("");
      window.location.reload();
    }
    setMessage(res.message || "");
  }

  function copyUri() {
    navigator.clipboard.writeText(uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <PageShell
      eyebrow="Sécurité"
      title="Authentification à deux facteurs"
      description="Renforcez la sécurité de votre compte avec un code à usage unique."
      actions={
        <Link href="/profil" className="btn-soft">
          <ArrowLeft size={16} /> Retour au profil
        </Link>
      }
    >
      <div className="mx-auto max-w-lg">
        {status === "loading" && (
          <div className="card-soft p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm text-slate-600">Chargement...</p>
          </div>
        )}

        {status === "setup" && (
          <div className="card-soft p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="text-indigo-600" size={28} />
              <h2 className="text-lg font-semibold text-slate-900">Activer le 2FA</h2>
            </div>
            <p className="text-sm text-slate-600">
              Scannez ce QR code avec votre application d&apos;authentification (Google Authenticator, Authy, 1Password...) ou copiez la clé secrète.
            </p>
            <div className="rounded-lg bg-white p-4 border border-slate-200">
              <p className="text-xs font-mono text-slate-700 break-all mb-2">{secret}</p>
              <button onClick={copyUri} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copié !" : "Copier le lien otpauth"}
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Code de vérification</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button onClick={handleConfirm} className="btn-soft btn-soft-primary w-full">
              Activer
            </button>
            {message && <p className="text-sm text-red-600">{message}</p>}
          </div>
        )}

        {status === "enabled" && (
          <div className="card-soft p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-600" size={28} />
              <h2 className="text-lg font-semibold text-slate-900">2FA activé</h2>
            </div>
            <p className="text-sm text-slate-600">
              Votre compte est protégé par un code à usage unique. Pour le désactiver, entrez un code actuel.
            </p>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Code de vérification</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleDisable}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 w-full"
            >
              Désactiver le 2FA
            </button>
            {message && <p className="text-sm text-red-600">{message}</p>}
          </div>
        )}

        {status === "disabled" && message && (
          <div className="card-soft p-6 text-center">
            <ShieldOff className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="text-sm text-slate-600">{message}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
