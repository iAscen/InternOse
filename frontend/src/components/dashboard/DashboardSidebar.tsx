import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '~/hooks';
import { useMobileSidebar } from '~/contexts/MobileSidebarContext';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const { t } = useTranslation();
  const { userRole } = useAuth();
  
  // Safely get mobile sidebar context with fallback
  const [localMobileOpen, setLocalMobileOpen] = React.useState(false);
  let mobileSidebarOpen = localMobileOpen;
  let setMobileSidebarOpen: (open: boolean) => void = (open: boolean) => setLocalMobileOpen(open);
  
  try {
    const context = useMobileSidebar();
    mobileSidebarOpen = context.mobileSidebarOpen;
    setMobileSidebarOpen = context.setMobileSidebarOpen;
  } catch {
    // Not in MobileSidebarProvider context - use local state as fallback
    // Already set above
  }

  const getNavItems = () => {
    switch (userRole) {
      case 'STUDENT':
        return [
          { id: 'overview', label: t('student.dashboard'), icon: 'home' },
          { id: 'cv', label: t('student.cv'), icon: 'document' },
          { id: 'offers', label: t('employer.offers'), icon: 'briefcase' },
          { id: 'applications', label: t('student.applications'), icon: 'clipboard' },
          { id: 'contracts', label: t('student.contracts'), icon: 'file' },
        ];
      case 'EMPLOYER':
        return [
          { id: 'overview', label: t('dashboard.title'), icon: 'home' },
          { id: 'offers', label: t('employer.internshipOffers'), icon: 'briefcase' },
          { id: 'approved-offers', label: t('employer.approvedInternshipOffers'), icon: 'clipboard' },
          { id: 'contracts', label: t('im.internshipContractsSection'), icon: 'file' },
          { id: 'history', label: t('im.history'), icon: 'clock'},
        ];
      case 'INTERNSHIP_MANAGER':
        return [
          { id: 'overview', label: t('im.dashboard'), icon: 'home' },
          { id: 'offers', label: t('im.internshipOffers'), icon: 'briefcase' },
          { id: 'approved-offers', label: t('im.approvedOffers'), icon: 'clipboard' },
          { id: 'cvs', label: t('im.resumesSection'), icon: 'document' },
          { id: 'contracts', label: t('im.internshipContractsSection'), icon: 'file' },
          { id: 'history', label: t('im.history'), icon: 'clock'}
        ];
      case 'PROFESSOR':
        return [
          { id: 'overview', label: t('professorDashboard.dashboard'), icon: 'home' },
          { id: 'etudiants', label: t('professorDashboard.students'), icon: 'person'}
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getIcon = (iconName: string, isActive: boolean) => {
    const baseClass = "inline-block flex-none transition-colors";
    const activeClass = isActive ? "size-6 text-indigo-600" : "size-6 text-slate-400 group-hover:text-indigo-500";
    const iconClass = `${baseClass} ${activeClass}`;
    
    switch (iconName) {
      case 'home':
        return (
          <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
          </svg>
        );
      case 'document':
        return (
          <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
          </svg>
        );
      case 'briefcase':
        return (
          <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" />
            <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 01-9.274 0C3.985 17.585 3 16.402 3 15.055z" />
          </svg>
        );
      case 'clipboard':
        return (
          <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0118 5.25v6.5A2.25 2.25 0 0115.75 14H13.5V16.25a2.25 2.25 0 01-2.25 2.25h-2.5a2.25 2.25 0 01-2.25-2.25V14H4.25A2.25 2.25 0 012 11.75v-6.5a2.25 2.25 0 012.238-2.238 3.75 3.75 0 016.524 0zM9.75 3.75a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5a.75.75 0 00-.75-.75zm3.75 0a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5a.75.75 0 00-.75-.75z" clipRule="evenodd" />
          </svg>
        );
      case 'file':
        return (
          <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      case 'person':
        return (
          <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14a6 6 0 0112 0v1H4v-1z" />
          </svg>
        )
      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <nav
        id="page-sidebar"
        className={`fixed start-0 z-[70] flex w-96 flex-col overflow-auto bg-slate-100 transition-transform duration-300 ease-out ${
          mobileSidebarOpen ? 'translate-x-0 top-0 bottom-0 h-screen' : '-translate-x-full lg:translate-x-0 top-0'
        } lg:top-0`}
        style={mobileSidebarOpen ? { height: '100vh' } : { height: 'calc(100vh - 7rem)' }}
        aria-label="Dashboard Navigation"
      >
        {/* Sidebar Header */}
        <div className="flex h-24 w-full flex-none items-center justify-between px-8 bg-slate-100">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 transition hover:opacity-80 active:opacity-100"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
              <svg
                className="bi bi-window-sidebar inline-block size-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M2.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2zm12 1a1 1 0 0 1 1 1v2H1V3a1 1 0 0 1 1-1h12zM1 13V6h4v8H2a1 1 0 0 1-1-1zm5 1V6h9v7a1 1 0 0 1-1 1H6z" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Intern<span className="text-indigo-600">OSE</span>
            </span>
          </Link>

          {/* Close Sidebar on Mobile */}
          <button
            type="button"
            className="flex size-10 items-center justify-center text-slate-400 hover:text-slate-600 active:text-slate-400 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <svg
              className="hi-solid hi-x -mx-1 inline-block size-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="w-full grow space-y-2 p-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`group flex w-full items-center gap-4 rounded-xl px-5 py-4 text-base font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100/50 border-2 border-indigo-200'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 active:bg-white/90 border-2 border-transparent'
                }`}
              >
                {getIcon(item.icon, isActive)}
                <span className="grow text-left">{item.label}</span>
                {isActive && (
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}

