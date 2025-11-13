import {useTranslation} from "react-i18next";

interface SortButtonProps {
    onClick: Function;
}

export default function SortButton({ onClick } : SortButtonProps) {
    const { t } = useTranslation();

    return (
        <button 
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-md shadow-sm hover:bg-white/90 hover:border-slate-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200" 
            onClick={() => onClick()}
        >
            <span>{t("im.sort")}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"/>
            </svg>
        </button>
    );
}
