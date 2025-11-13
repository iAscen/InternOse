import {useTranslation} from "react-i18next";

interface FilterButtonProps {
    onClick: Function;
}

export default function FilterButton({ onClick } : FilterButtonProps) {
    const { t } = useTranslation();

    return (
        <button 
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-md shadow-sm hover:bg-white/90 hover:border-slate-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200" 
            onClick={() => onClick()}
        >
            <span>{t("im.filter")}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>
            </svg>
        </button>
    )
}
