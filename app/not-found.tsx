import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <div className="rounded-[20px] border-2 border-slate-900 bg-indigo-600 p-4 text-white shadow-[4px_4px_0px_#0f172a]">
        <span className="text-3xl font-black">404</span>
      </div>
      <h1 className="text-2xl font-black text-slate-900">Page introuvable</h1>
      <p className="text-sm font-semibold text-slate-500">
        Cette page n&apos;existe pas ou n&apos;est plus accessible. Elle a peut-être été déplacée ou son contenu est privé.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="bento-btn bento-btn-primary">
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>
        <Link href="/annuaire/societes" className="bento-btn">
          <Compass size={16} /> Explorer l&apos;annuaire
        </Link>
      </div>
    </div>
  );
}
