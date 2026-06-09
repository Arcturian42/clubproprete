"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterResult } from "@/lib/actions/newsletter";

const initialState: NewsletterResult = { success: false, message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  return (
    <div className="mt-4">
      <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <input
          className="bento-input w-full"
          type="email"
          name="email"
          placeholder="email@entreprise.fr"
          aria-label="Votre adresse email pour la newsletter"
          required
          disabled={pending}
        />
        <button className="bento-btn bento-btn-accent" type="submit" disabled={pending}>
          {pending ? "..." : "Ajouter"}
        </button>
      </form>
      {state.message ? (
        <p
          role="status"
          className={`mt-3 text-sm font-semibold ${state.success ? "text-emerald-700" : "text-rose-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
