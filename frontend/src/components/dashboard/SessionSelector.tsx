import { useTranslation } from 'react-i18next';
import { formatSessionForDisplay} from "~/utils/sessionUtils";

interface SessionSelectorProps {
  id: string;
  value: string;
  availableSessions: string[];
  onChange: (session: string) => void;
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

