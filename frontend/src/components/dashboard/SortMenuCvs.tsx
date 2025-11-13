import {useState} from "react";
import {useTranslation} from "react-i18next";

interface SortMenuOffersProps {
  applySorting: Function;
}

export default function SortMenuOffers({applySorting}: SortMenuOffersProps) {
  const {t} = useTranslation();
  const [ascending, setAscending] = useState(false);

  const onClick = (sortBy: string) => {
    applySorting(sortBy, ascending ? "asc" : "desc")
  }

  return (
    <div className="absolute end-0 z-10 mt-2 w-64 rounded-lg shadow-xl ltr:origin-top-right rtl:origin-top-left">
      <div className="rounded-lg bg-white py-2.5 ring-1 ring-black/5">
        <div className="px-4 py-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('im.sortBy')}</h3>
        <button onClick={() => onClick("status")}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          {t("im.status")}
        </button>
        <button onClick={() => onClick("name")}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          {t("im.name")}
        </button>
        <button onClick={() => onClick("email")}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          {t("common.email")}
        </button>
        <button onClick={() => onClick("date")}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          {"Date"}
        </button>

        <div className="mt-4 flex items-center justify-between">
          <label htmlFor="toggleOrder" className="text-sm text-gray-700">
            {t('im.ascendingOrder')}
          </label>
          <input
            id="toggleOrder"
            type="checkbox"
            onChange={(e) => setAscending(!ascending)}
            className="toggle-checkbox accent-blue-600 w-5 h-5 cursor-pointer"
          />
        </div>
        </div>
      </div>
    </div>
  )
}
