import {Link} from "react-router";
import {useState, useRef, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {userAPI} from "~/services/UserAPI";
import {useAuth, useClickOutside} from "~/hooks";
import LanguageSwitcher from "./LanguageSwitcher";
import ClientOnly from "./ClientOnly";
import { useMobileSidebar } from "~/contexts/MobileSidebarContext";
import { NotificationsModal } from "./NotificationsModal";
import type { Notification } from "~/interfaces";


export default function Header() {
  const {isAuthenticated, userRole, userName, userEmail} = useAuth();
  const {t} = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsError, setNotificationsError] = useState<String | null>(null)
  const [showNotificationsModal, setShowModificationsModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications()
  }, [])

  const getUserId = async () => {
   const role = userAPI.getUserRoleFromJWT()
   let id = null

   if (role === "EMPLOYER")
      id = await userAPI.getEmployerIdFromJWT()
    if (role === "PROFESSOR")
      id = await userAPI.getProfessorIdFromJWT()
    if (role === "STUDENT")
      id = await userAPI.getStudentIdFromJWT()
    if (role === 'INTERNSHIP_MANAGER')
      id = await userAPI.getInternshipManagerIdFromJWT()

    return id;
  }

  const loadNotifications = async () => {
    try {
      const userId = await getUserId()
      if (userId) {
        const response = await userAPI.getNotifications(userId)
        if (response.success && response.data) {
          setNotifications(response.data)
        }
        else 
          setNotificationsError(response.error ?? t('navigation.notificationsNotFoundError'))
      }
      else {
        setNotificationsError(t('navigation.notificationsNotFoundError'))
      }
    } catch(Error) {
      setNotificationsError(t('navigation.notificationsNotFoundError'))
    }
  }

  const checkNotification = async (notificationId: number) => {
    try {
      const response = await userAPI.checkNotification(notificationId)

      if (response.error)
        setNotificationsError(response.error)
    } catch(Error) {
      setNotificationsError(t('navigation.notificationCheckingError'))
    }
  }

  const onNotificationDeletionButtonClick = async (notificationId: number) => {
    await checkNotification(notificationId)
    await loadNotifications()
  }
  
  // Get mobile sidebar state if on dashboard
  const isDashboard = isAuthenticated && (userRole === 'EMPLOYER' || userRole === 'STUDENT' || userRole === 'INTERNSHIP_MANAGER' || userRole === 'PROFESSOR');
  let mobileSidebarContext;
  try {
    mobileSidebarContext = useMobileSidebar();
  } catch {
    // Not in MobileSidebarProvider context (not on dashboard)
    mobileSidebarContext = null;
  }

  useClickOutside(menuRef, () => setShowUserMenu(false));
  useClickOutside(mobileMenuRef, () => setShowMobileMenu(false));

  return (
    <header className={`sticky top-0 z-100 ${isDashboard ? 'bg-slate-100 lg:ml-96' : 'bg-white'} shadow-xs border-b border-slate-200`}>
      <div className={`${isDashboard ? 'mx-auto w-full xl:max-w-7xl' : 'w-full'} px-2 sm:px-4 md:px-6 lg:px-8`}>
        <div className={`${isDashboard ? 'container mx-auto px-4 sm:px-0' : ''} flex items-center h-16 sm:h-18 md:h-20 w-full`}>
          {/* Mobile Sidebar Toggle Button - only on dashboard */}
          {isDashboard && mobileSidebarContext && (
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center gap-2 rounded-sm border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-100 mr-2"
              onClick={() => mobileSidebarContext.setMobileSidebarOpen(true)}
            >
              <svg
                className="hi-solid hi-menu-alt-1 inline-block size-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          
          {/* Left side: Logo - only show if not on dashboard */}
          {!isDashboard && (
            <div className="flex items-center flex-1">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg sm:text-xl">I</span>
                  </div>
                  <span className="ml-2 sm:ml-3 text-xl sm:text-2xl font-bold text-slate-900">InternOSE</span>
                </Link>
              </div>

              {/* Navigation - only show if not on dashboard */}
              <nav className="hidden lg:flex ml-4 md:ml-6 lg:ml-8 space-x-3 md:space-x-4 lg:space-x-6">
                <ClientOnly 
                  fallback={<div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>}
                  waitForI18n={true}
                >
                  {!isAuthenticated && (
                    <Link
                      to="/"
                      className="text-slate-700 hover:text-indigo-600 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-semibold transition-colors hover:bg-slate-100"
                    >
                      {t('navigation.home')}
                    </Link>
                  )}
                </ClientOnly>
              </nav>
            </div>
          )}


          {/* Right side: Notification bell (left) + languageSwitcher(center) + Actions (right) */}
          <div className={`flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0 ${isDashboard ? 'ml-auto' : ''}`}>
            
          {userAPI.isAuthenticated() &&
          <ClientOnly>
          <div role='bell' onClick={() => setShowModificationsModal(true)} className="relative me-2 z-[100]">
            {/* Bell icon */}
            <svg
              className="w-6 h-6 text-gray-700 hover:text-gray-900 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* Red badge */}
            { notifications && notifications.length >= 1 &&
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {notifications.length}
              </span>
            } 
          </div> </ClientOnly>}

          {showNotificationsModal && 
            <NotificationsModal 
              onClose={() => setShowModificationsModal(false)}
              notifications={notifications}
              error={notificationsError}
              onNotificationDeletionButtonClick={onNotificationDeletionButtonClick}
              >
            </NotificationsModal>
          }
            
            {/* Language Switcher - Always on the left */}
            <ClientOnly 
              fallback={<div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>}
              waitForI18n={true}
            >
              <LanguageSwitcher/>
            </ClientOnly>

            <ClientOnly 
              fallback={<div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>}
              waitForI18n={true}
            >
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signup"
                    className="hidden sm:flex items-center justify-between rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:border-indigo-200 active:bg-indigo-700 transition-colors"
                  >
                    {t('common.signup')}
                  </Link>
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center justify-between rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:border-indigo-200 active:bg-indigo-700 transition-colors"
                  >
                    {t('common.login')}
                  </Link>
                </>
              ) : (
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                {/* Menu déroulant utilisateur */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="group flex items-center justify-between rounded-md border border-slate-200/60 bg-white/80 backdrop-blur-sm px-2.5 py-2 h-9 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white/90 hover:border-slate-300 hover:text-indigo-600 active:border-indigo-200 active:bg-white/95 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200 sm:gap-2"
                  >
                    <span className="sm:hidden">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="hidden sm:inline-block">{userName}</span>
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      className="hi-solid hi-chevron-down inline-block size-5 text-slate-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>

                  {/* Menu déroulant */}
                  {showUserMenu && (
                    <div
                      className="absolute end-0 mt-2 w-48 rounded-sm shadow-xl shadow-slate-200 origin-top-right z-50"
                      role="menu"
                      aria-labelledby="user-menu"
                    >
                      <div className="divide-y divide-slate-100 rounded-sm bg-white ring-1 ring-slate-900/5">
                        <div className="space-y-1 p-2">
                          <div className="px-3 py-2">
                            <p className="text-sm font-semibold text-slate-900">{userName}</p>
                            <p className="text-xs font-medium text-slate-500">{userEmail}</p>
                          </div>
                        </div>
                        <div className="space-y-1 p-2">
                          <button
                            onClick={() => {
                              userAPI.removeToken();
                              window.location.href = '/';
                            }}
                            className="group flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 hover:text-slate-700"
                            role="menuitem"
                          >
                            <svg
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                              className="hi-solid hi-lock-closed inline-block size-5 text-slate-300 group-hover:text-indigo-500"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            <span>{t('common.logout')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}
            </ClientOnly>

            {/* Mobile menu button - only show if not on dashboard */}
            {!isDashboard && (
              <div className="sm:hidden ml-2" ref={mobileMenuRef}>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 text-slate-700 hover:text-indigo-600 focus:outline-none focus:text-indigo-600"
                  aria-label="Menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>

                {/* Mobile dropdown menu */}
                {showMobileMenu && (
                  <div
                    className="absolute right-2 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <ClientOnly 
                      fallback={<div className="p-4"><div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div><div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div></div>}
                      waitForI18n={true}
                    >
                      {!isAuthenticated ? (
                        <>
                          <Link
                            to="/login"
                            onClick={() => setShowMobileMenu(false)}
                            className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            {t('common.login')}
                          </Link>
                          <Link
                            to="/signup"
                            onClick={() => setShowMobileMenu(false)}
                            className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-200"
                          >
                            {t('common.signup')}
                          </Link>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 border-b border-slate-200">
                            <p className="text-sm font-semibold text-slate-900">
                              {userRole === 'EMPLOYER' && t('auth.employerAccount')}
                              {userRole === 'STUDENT' && t('auth.studentAccount')}
                              {userRole === 'INTERNSHIP_MANAGER' && t('auth.imAccount')}
                            </p>
                            <p className="text-xs font-medium text-slate-500">{userEmail}</p>
                          </div>
                          <button
                            onClick={() => {
                              userAPI.removeToken();
                              window.location.href = '/';
                            }}
                            className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            {t('common.logout')}
                          </button>
                        </>
                      )}
                    </ClientOnly>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
