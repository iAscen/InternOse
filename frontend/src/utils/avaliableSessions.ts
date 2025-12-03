import type { InternshipOffer } from "~/interfaces";

/**
 * Génère la session actuelle (Winter-YYYY)
 * Basé sur la logique : si on est à partir du 1er mai, la session devient Hiver de l'année suivante
 * Exemple : 1er mai 2025 -> Winter-2026, mais mars 2025 -> Winter-2025
 */
export function getCurrentSession(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Si on est à partir du 1er mai (mois >= 5 et jour >= 1), on est dans la session de l'année suivante
  if (month > 5 || (month === 5 && day >= 1)) {
    return `Winter-${year + 1}`;
  }

  // Avant le 1er mai, on est dans la session de l'année en cours
  return `Winter-${year}`;
}

export function getAvailableSessions(
  offers: InternshipOffer[],
  onlyApproved: boolean = false
): string[] {
  const sessions = new Set<string>();

  // Toujours inclure la session actuelle (2025)
  const currentSession = getCurrentSession();
  sessions.add(currentSession);

  // Ajouter les sessions des offres
  offers.forEach(offer => {
    if (offer.session) {
      if (onlyApproved && offer.verificationStatus === 'APPROVED') {
        sessions.add(offer.session);
      } else if (!onlyApproved) {
        sessions.add(offer.session);
      }
    }
  });

  // Extraire toutes les années uniques
  const years = new Set<number>();
  sessions.forEach(session => {
    const parts = session.split(/[-\s]+/);
    const year = parseInt(parts[1] || '0', 10);
    if (year > 0) {
      years.add(year);
    }
  });

  // Trouver l'année minimale et maximale
  const currentYear = new Date().getFullYear();
  const minYear = Math.min(...Array.from(years), currentYear - 5); // Au moins 5 ans en arrière
  const maxYear = Math.max(...Array.from(years), currentYear);

  // Ajouter toutes les sessions de minYear à maxYear
  for (let year = minYear; year <= maxYear; year++) {
    sessions.add(`Winter-${year}`);
  }

  return Array.from(sessions).sort((a, b) => {
    const parseSession = (session: string) => {
      const parts = session.split(/[-\s]+/);
      const year = parseInt(parts[1] || '0', 10);
      return { year };
    };

    const sessionA = parseSession(a);
    const sessionB = parseSession(b);

    // Trier par année décroissante
    return sessionB.year - sessionA.year;
  });
}
