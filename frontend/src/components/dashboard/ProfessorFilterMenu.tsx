import {useTranslation} from 'react-i18next';
import ProgramSelector from "~/components/ProgramSelector";

interface ProfessorFilterMenuProps {
  filters: {
    company?: string;
    status?: string;
    program?: string;
  };
  onFilterChange: (filterType: 'company' | 'status' | 'program', value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function ProfessorFilterMenu({
                                              filters,
                                              onFilterChange,
                                              onClearFilters,
                                              hasActiveFilters
                                            }: ProfessorFilterMenuProps) {
  const {t} = useTranslation();

  return (
    <div
      className="absolute end-0 z-[100] mt-2 w-96 rounded-lg shadow-xl max-h-[600px] ltr:origin-top-right rtl:origin-top-left"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="rounded-lg bg-white py-2.5 ring-1 ring-black/5 max-h-[600px] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('professor.filterBy')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('professor.filterByCompany')}
              </label>
              <input
                type="text"
                value={filters.company || ''}
                onChange={(e) => onFilterChange('company', e.target.value)}
                placeholder={t('professor.filterByCompany')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <ProgramSelector value={filters.program || ''} onChange={(e) => onFilterChange('program', (e.target as HTMLSelectElement).value)}></ProgramSelector>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('professor.filterByStatus')}
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-900 bg-white">{t('professor.allStatuses')}</option>
                <option value="fullySigned" className="text-gray-900 bg-white">{t('professor.contractFullySigned')}</option>
                <option value="pendingSignatures" className="text-gray-900 bg-white">{t('professor.contractPending')}</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="border-t border-gray-200 mt-6 pt-4">
              <button
                onClick={onClearFilters}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                {t('common.clear') || 'Effacer les filtres'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

