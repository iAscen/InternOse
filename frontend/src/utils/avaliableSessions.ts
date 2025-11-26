import type { InternshipOffer } from "~/interfaces";

export function getAvailableSessions(
  offers: InternshipOffer[],
  onlyApproved: boolean = false
): string[] {
  const sessions = new Set<string>();

  offers.forEach(offer => {
    if (offer.session) {

      if (onlyApproved && offer.verificationStatus === 'APPROVED') {
        sessions.add(offer.session);
      } else if (!onlyApproved) {
        sessions.add(offer.session);
      }
    }
  });

  return Array.from(sessions).sort((a, b) => {

    const parseSession = (session: string) => {
      const parts = session.split(/[-\s]+/);
      const season = parts[0]?.toLowerCase();
      const year = parseInt(parts[1] || '0', 10);

      // Winter = 0 (toutes les sessions sont Winter maintenant)
      const seasonValue = 0;

      return { year, seasonValue };
    };

    const sessionA = parseSession(a);
    const sessionB = parseSession(b);


    if (sessionA.year !== sessionB.year) {
      return sessionB.year - sessionA.year;
    }

    return sessionB.seasonValue - sessionA.seasonValue;
  });
}
