export function formatLastWornDate(dateString: string | null) {
  if (!dateString) return "Nog nooit gedragen";

  return new Date(dateString).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getDaysSince(dateString: string | null) {
  if (!dateString) return 9999;

  const diff = Date.now() - new Date(dateString).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getLastWornRelative(dateString: string | null) {
  if (!dateString) return "Nog nooit gedragen";

  const days = getDaysSince(dateString);

  if (days === 0) return "Vandaag gedragen";
  if (days === 1) return "Gisteren gedragen";

  return `${days} dagen geleden`;
}
