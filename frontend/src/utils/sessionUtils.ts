/**
 * Formate une session pour l'affichage avec i18n
 * "Winter-2025" -> "Hiver 2025" (fr) ou "Winter 2025" (en)
 *
 * @param session - The session string in format "Winter-YYYY"
 * @param t - The translation function from i18next
 * @returns Formatted session string
 */
export function formatSessionForDisplay(session: string, t: (key: string, options?: any) => string): string {
  if (!session) return session;

  // Extraire l'année
  const parts = session.split(/[-\s]+/);
  const year = parts[1] || parts[0]?.match(/\d{4}/)?.[0] || '';

  // Retourner la traduction (toujours Winter/Hiver)
  return t('common.winterSession', { year });
}

