"use client";

export function RoleSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="role"
      defaultValue={defaultValue}
      className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold"
      onChange={(e) => {
        const form = e.currentTarget.closest("form") as HTMLFormElement;
        form?.requestSubmit();
      }}
    >
      <option value="registered_user">Utilisateur</option>
      <option value="company_owner">Société</option>
      <option value="supplier_owner">Fournisseur</option>
      <option value="independent_profile">Indépendant</option>
      <option value="candidate_profile">Candidat</option>
      <option value="training_organization">Organisme</option>
      <option value="author">Auteur</option>
      <option value="admin">Admin</option>
    </select>
  );
}
