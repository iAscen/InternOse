import { useTranslation } from 'react-i18next';

interface SessionSelectorProps {
  id: string;
  value: string;
  availableSessions: string[];
  onChange: (session: string) => void;
}

/**
 * Formate une session pour l'affichage avec i18n
 * "Winter-2024" -> "Hiver 2024" (fr) ou "Winter 2024" (en)
 */
function formatSessionForDisplay(session: string, t: any): string {
  if (!session) return session;
  
  // Extraire l'année
  const parts = session.split(/[-\s]+/);
  const year = parts[1] || parts[0]?.match(/\d{4}/)?.[0] || '';
  
  // Retourner la traduction (toujours Winter/Hiver)
  return t('common.winterSession', { year });
}

export default function SessionSelector({ id, value, availableSessions, onChange }: SessionSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 whitespace-nowrap">
        {t("im.session")}:
      </label>
      <select
        id={id}
        name="session"
        value={value}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 min-w-[150px]"
        onChange={(e) => onChange(e.target.value)}
      >
        {availableSessions.map((session) => (
          <option key={session} value={session} className="text-gray-900 bg-white">
            {formatSessionForDisplay(session, t)}
          </option>
        ))}
      </select>
    </div>
  );
}

