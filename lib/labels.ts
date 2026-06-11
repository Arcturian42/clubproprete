// Traductions des valeurs d'énumération stockées en base pour l'affichage.

export const availabilityLabels: Record<string, string> = {
  immediate: "Disponible immédiatement",
  two_weeks: "Sous 2 semaines",
  one_month: "Sous 1 mois",
  three_months: "Sous 3 mois",
  unavailable: "Indisponible",
};

export function getAvailabilityLabel(status: string | null | undefined): string {
  if (!status) return "Disponible";
  return availabilityLabels[status] ?? status;
}
