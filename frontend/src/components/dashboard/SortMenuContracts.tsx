import {useTranslation} from "react-i18next";

interface SortOption {
  key: string;
  labelKey: string;
}

interface SortMenuContractsProps {
  applySorting: Function;
}

export default function SortMenuContracts({applySorting}: SortMenuContractsProps) {
  const {t} = useTranslation();

  const sortOptions: SortOption[] = [
    { key: 'status', labelKey: 'im.status' },
    { key: 'title', labelKey: 'im.title' }
  ];

  return (
    <div className="absolute end-0 z-[100] mt-2 w-64 rounded-lg shadow-xl ltr:origin-top-right rtl:origin-top-left">
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

