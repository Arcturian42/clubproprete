"use client";

import { useState } from "react";
import { Linkedin } from "lucide-react";

type FounderCardProps = {
  name: string;
  role: string;
  photoSrc: string;
  linkedinUrl: string;
};

export function FounderCard({ name, role, photoSrc, linkedinUrl }: FounderCardProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <a
      href={linkedinUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-[14px] border-2 border-slate-200 bg-white p-3 transition-colors hover:border-indigo-600"
    >
      {photoFailed ? (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-indigo-100 text-sm font-black text-indigo-600">
          {initials}
        </div>
      ) : (
        <img
          src={photoSrc}
          alt={`Photo de ${name}`}
          className="h-12 w-12 shrink-0 rounded-full border-2 border-slate-900 object-cover"
          onError={() => setPhotoFailed(true)}
        />
      )}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-sm font-black text-slate-900 group-hover:text-indigo-600">
          {name}
          <Linkedin size={13} className="shrink-0 text-indigo-600" aria-hidden="true" />
        </p>
        <p className="truncate text-xs font-semibold text-slate-500">{role}</p>
      </div>
    </a>
  );
}
