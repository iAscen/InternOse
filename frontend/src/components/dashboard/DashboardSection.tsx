import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import SortButton from './SortButton';
import FilterButton from './FilterButton';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  showSort?: boolean;
  showFilter?: boolean;
  sortMenu?: ReactNode;
  filterMenu?: ReactNode;
  sortMenuRef?: RefObject<HTMLDivElement | null>;
  filterMenuRef?: RefObject<HTMLDivElement | null>;
  onSortToggle?: () => void;
  onFilterToggle?: () => void;
  children: ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export default function DashboardSection({
  title,
  subtitle,
  showSort = false,
  showFilter = false,
  sortMenu,
  filterMenu,
  sortMenuRef,
  filterMenuRef,
  onSortToggle,
  onFilterToggle,
  children,
  loading = false,
  emptyMessage,
  emptySubMessage
}: DashboardSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto px-4 sm:px-0 pt-4 pb-8 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="px-6 pt-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t(title)}</h2>
              {subtitle && (
                <p className="text-sm font-medium text-slate-500 mt-1">{t(subtitle)}</p>
              )}
            </div>
            {(showSort || showFilter) && (
              <div className="flex items-center gap-2">
                {showSort && (
                  <div className="relative z-10" ref={sortMenuRef}>
                    <SortButton onClick={onSortToggle || (() => {})} />
                    {sortMenu}
                  </div>
                )}
                {showFilter && (
                  <div className="relative z-10" ref={filterMenuRef}>
                    <FilterButton onClick={onFilterToggle || (() => {})} />
                    {filterMenu}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="p-6 overflow-hidden">
          {loading ? (
            <div className="text-center p-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-sm font-medium text-slate-500">{t('common.loading')}</p>
            </div>
          ) : emptyMessage ? (
            <div className="text-center p-6 text-sm font-medium text-slate-500">
              <p className="text-slate-700 text-lg mb-2">{t(emptyMessage)}</p>
              {emptySubMessage && (
                <p className="text-slate-500 text-sm">{t(emptySubMessage)}</p>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

