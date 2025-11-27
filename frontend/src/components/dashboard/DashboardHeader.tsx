import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardHeaderProps {
  subtitle: string;
  rightContent?: ReactNode;
  variant?: 'default' | 'history'; // Pour le variant avec session selector
}

export default function DashboardHeader({ subtitle, rightContent, variant = 'default' }: DashboardHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <div className="mx-auto px-4 sm:px-0 pt-6 pb-3 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
      {variant === 'history' ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed">
            {t(subtitle)}
          </p>
          {rightContent && (
            <div className="flex items-center gap-2">
              {rightContent}
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed">
              {t(subtitle)}
            </p>
          </div>
          {rightContent && (
            <div className="flex items-center gap-4">
              {rightContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

