type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="surface p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-2xl font-extrabold text-slate-950">{value}</p>
      {detail ? <p className="mt-1 text-sm font-semibold text-slate-500">{detail}</p> : null}
    </div>
  );
}
