import {useTranslation} from "react-i18next";

interface SortOption {
  key: string;
  labelKey: string;
}

interface SortMenuOffersProps {
  applySorting: Function;
  userRole: 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER';
}

export default function SortMenuOffers({applySorting, userRole}: SortMenuOffersProps) {
  const {t} = useTranslation();

  // Define sort options based on user role
  const getSortOptions = (): SortOption[] => {
    switch (userRole) {
      case 'INTERNSHIP_MANAGER':
        return [
          { key: 'status', labelKey: 'im.status' },
          { key: 'program', labelKey: 'im.program' },
          { key: 'title', labelKey: 'im.title' }
        ];
      case 'STUDENT':
        return [
          { key: 'title', labelKey: 'im.title' },
          { key: 'program', labelKey: 'student.program' },
          { key: 'salary', labelKey: 'student.salary' },
          { key: 'duration', labelKey: 'student.duration' }
        ];
      case 'EMPLOYER':
        return [
          { key: 'date', labelKey: 'employer.date' },
          { key: 'status', labelKey: 'employer.status' }
        ];
      default:
        return [];
    }
  };

  const sortOptions = getSortOptions();

  return (
    <div className="absolute end-0 z-10 mt-2 w-64 rounded-lg shadow-xl ltr:origin-top-right rtl:origin-top-left">
      <div className="rounded-lg bg-white py-2.5 ring-1 ring-black/5">
        <div className="px-4 py-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('im.sortBy')}</h3>
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => applySorting(option.key)}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
