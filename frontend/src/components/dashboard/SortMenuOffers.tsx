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
          { key: 'jobTitle', labelKey: 'student.jobTitle' },
          { key: 'company', labelKey: 'student.company' },
          { key: 'program', labelKey: 'student.program' },
          { key: 'location', labelKey: 'student.location' },
          { key: 'salary', labelKey: 'student.salary' },
          { key: 'duration', labelKey: 'student.duration' },
          { key: 'startDate', labelKey: 'student.startDate' }
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
    <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4">
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
  )
}
