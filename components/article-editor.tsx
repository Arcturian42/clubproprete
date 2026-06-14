"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Bold, Italic, Heading2, List, Link2, ImagePlus, X } from "lucide-react";

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    return json?.success && json.url ? (json.url as string) : null;
  } catch {
    return null;
  }
}

function ToolbarButton({
  onClick,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-[8px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/**
 * Éditeur d'article au format Markdown, avec barre d'outils (gras, italique,
 * titre, liste, lien, image). Les images sont téléversées (Vercel Blob) puis
 * insérées en Markdown. Le contenu est rendu via react-markdown sur la fiche.
 */
export function ArticleEditor({
  name,
  defaultValue,
  placeholder,
  required,
  rows = 14,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  function wrapSelection(before: string, after = before, fallback = "texte") {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end) || fallback;
    ta.value = ta.value.slice(0, start) + before + selected + after + ta.value.slice(end);
    ta.focus();
    ta.selectionStart = start + before.length;
    ta.selectionEnd = start + before.length + selected.length;
  }

  function prefixLine(prefix: string) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
    ta.value = ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = start + prefix.length;
  }

  function insertText(text: string) {
    const ta = ref.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    ta.value = ta.value.slice(0, pos) + text + ta.value.slice(pos);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + text.length;
  }

  function pickImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      const url = await uploadFile(file);
      setUploading(false);
      if (url) insertText(`\n\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n\n`);
    };
    input.click();
  }

  return (
    <div className="rounded-[14px] border-2 border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b-2 border-slate-200 p-1.5">
        <ToolbarButton onClick={() => wrapSelection("**")} title="Gras"><Bold size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("*")} title="Italique"><Italic size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => prefixLine("## ")} title="Titre"><Heading2 size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => prefixLine("- ")} title="Liste"><List size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection("[", "](https://)", "lien")} title="Lien"><Link2 size={16} /></ToolbarButton>
        <ToolbarButton onClick={pickImage} title="Insérer une image" disabled={uploading}><ImagePlus size={16} /></ToolbarButton>
        <span className="ml-auto pr-2 text-[11px] font-bold text-slate-400">
          {uploading ? "Téléversement…" : "Markdown"}
        </span>
      </div>
      <textarea
        ref={ref}
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className="block w-full resize-y rounded-b-[12px] border-0 bg-transparent p-3 text-sm font-medium leading-6 text-slate-700 focus:outline-none focus:ring-0"
      />
    </div>
  );
}

/**
 * Champ d'upload d'une image (couverture / meta-image), stockée sur Vercel Blob.
 * La valeur (URL) est exposée dans un input caché `name`.
 */
export function ImageUploadField({
  name,
  label = "Image de couverture",
  defaultValue = "",
  required = false,
}: {
  name: string;
  label?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploaded = await uploadFile(file);
    setUploading(false);
    if (uploaded) setUrl(uploaded);
    event.target.value = "";
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} required={required} aria-required={required} />
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-[10px] border-2 border-slate-200 bg-slate-50">
          {url ? (
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <ImagePlus size={20} aria-hidden="true" />
            </div>
          )}
        </div>
        <label className="bento-btn cursor-pointer">
          <input type="file" accept="image/*" hidden onChange={onChange} />
          {uploading ? "Envoi…" : url ? "Changer l'image" : label}
        </label>
        {url && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700"
          >
            <X size={14} /> Retirer
          </button>
        )}
      </div>
    </div>
  );
}
