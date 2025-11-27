import type { ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  error?: string | null;
  children: ReactNode;
}

export default function DashboardLayout({
  activeTab,
  onTabChange,
  error,
  children
}: DashboardLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full min-w-[320px] flex-col bg-slate-100 lg:ps-96">
      <DashboardSidebar activeTab={activeTab} onTabChange={onTabChange} />
      
      <main id="page-content" className="flex max-w-full flex-auto flex-col pt-20 lg:pt-0 bg-slate-100">
        <div className="mx-auto w-full xl:max-w-7xl bg-slate-100">
          {error && (
            <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

