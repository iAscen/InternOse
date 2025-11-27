import { useTranslation } from 'react-i18next';

interface ProfessorSortMenuProps {
  onSortChange: (sortBy: string) => void;
}

export default function ProfessorSortMenu({ onSortChange }: ProfessorSortMenuProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute end-0 z-[100] mt-2 w-64 rounded-lg shadow-xl ltr:origin-top-right rtl:origin-top-left">
      <div className="rounded-lg bg-white py-2.5 ring-1 ring-black/5">
        <div className="px-4 py-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('professor.sortBy')}</h3>
          <button
            onClick={() => onSortChange('name')}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('professor.sortByName')}
          </button>
          <button
            onClick={() => onSortChange('company')}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('professor.sortByCompany')}
          </button>
          <button
            onClick={() => onSortChange('program')}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('professor.sortByProgram')}
          </button>
          <button
            onClick={() => onSortChange('status')}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('professor.sortByStatus')}
          </button>
          <button
            onClick={() => onSortChange('startdate')}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t('professor.sortByStartDate')}
          </button>
        </div>
      </div>
    </div>
  );
}

