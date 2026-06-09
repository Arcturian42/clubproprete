import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, description, actions, children }: PageShellProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-indigo-600">{eyebrow}</p> : null}
          <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base font-medium leading-7 text-slate-500">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
