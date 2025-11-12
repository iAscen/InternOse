import {useTranslation} from "react-i18next";

interface SortMenuOffersProps {
  applySorting: Function;
}

export default function SortMenuOffers({applySorting}: SortMenuOffersProps) {
  const {t} = useTranslation();

  return (
    <div className="absolute end-0 z-10 mt-2 w-64 rounded-lg shadow-xl ltr:origin-top-right rtl:origin-top-left">
      <div className="rounded-lg bg-white py-2.5 ring-1 ring-black/5">
        <div className="px-4 py-2">
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
    </div>
  )
}
