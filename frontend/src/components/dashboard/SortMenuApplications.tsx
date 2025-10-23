import {useTranslation} from "react-i18next";

interface SortMenuOffersProps {
  applySorting: Function;
}

export default function SortMenuOffers({applySorting}: SortMenuOffersProps) {
  const {t} = useTranslation();

  return (
    <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('im.sortBy')}</h3>
        <button onClick={() => applySorting("status")}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          {t('im.status')}
        </button>
        <button onClick={() => applySorting("date")}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
           Date
        </button>
      </div>
    </div>
  )
}
