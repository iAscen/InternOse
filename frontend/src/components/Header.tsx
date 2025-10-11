import {Link} from "react-router";
import {useState, useRef} from "react";
import {useTranslation} from "react-i18next";
import {apiService} from "~/services/apiService";
import {useAuth, useClickOutside} from "~/hooks";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const {isAuthenticated, userRole, userName, userEmail} = useAuth();
  const {t} = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setShowUserMenu(false));
  useClickOutside(mobileMenuRef, () => setShowMobileMenu(false));

  return (
    <header className="bg-gray-50 shadow-lg border-b border-gray-200">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 w-full">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">I</span>
                </div>
                <span className="ml-2 sm:ml-3 text-xl sm:text-2xl font-bold text-gray-900">InternOSE</span>
              </Link>
            </div>

            {/* Navigation - right next to logo */}
            <nav className="hidden lg:flex ml-4 md:ml-6 lg:ml-8 space-x-3 md:space-x-4 lg:space-x-6">
              {!isAuthenticated && (
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-semibold transition-colors hover:bg-gray-100"
                >
                  {t('navigation.home')}
                </Link>
              )}
              {isAuthenticated && userRole === 'EMPLOYER' && (
                <Link
                  to="/employer-dashboard"
                  className="text-gray-700 hover:text-blue-600 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-semibold transition-colors hover:bg-gray-100"
                >
                  {t('employer.dashboard')}
                </Link>
              )}
              {isAuthenticated && userRole === 'STUDENT' && (
                <Link
                  to="/student-dashboard"
                  className="text-gray-700 hover:text-blue-600 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-semibold transition-colors hover:bg-gray-100"
                >
                  {t('student.dashboard')}
                </Link>
              )}
              {isAuthenticated && userRole === 'INTERNSHIP_MANAGER' && (
                <Link
                  to="/im-dashboard"
                  className="text-gray-700 hover:text-blue-600 px-2 md:px-3 py-2 rounded-md text-sm md:text-base font-semibold transition-colors hover:bg-gray-100"
                >
                  {t('im.dashboard')}
                </Link>
              )}
            </nav>
          </div>

          {/* Right side: Actions + Language Switcher */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="hidden sm:inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {t('common.signup')}
                </Link>
                <Link
                  to="/login"
                  className="hidden sm:inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {t('common.login')}
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                {/* Menu déroulant utilisateur */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span className="font-medium">
                      {userName}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {/* Menu déroulant */}
                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{userName}</p>
                            <p className="text-xs text-gray-500">{userEmail}</p>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <button
                            onClick={() => {
                              apiService.removeToken();
                              window.location.href = '/';
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            {t('common.logout')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu button - Show hamburger menu on small screens */}
            <div className="sm:hidden ml-2" ref={mobileMenuRef}>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                aria-label="Menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>

              {/* Mobile dropdown menu */}
              {showMobileMenu && (
                <div
                  className="absolute right-2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setShowMobileMenu(false)}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {t('common.login')}
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setShowMobileMenu(false)}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200"
                      >
                        {t('common.signup')}
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {userRole === 'EMPLOYER' && t('auth.employerAccount')}
                          {userRole === 'STUDENT' && t('auth.studentAccount')}
                          {userRole === 'INTERNSHIP_MANAGER' && t('auth.imAccount')}
                        </p>
                        <p className="text-xs text-gray-500">{userEmail}</p>
                      </div>
                      <button
                        onClick={() => {
                          apiService.removeToken();
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {t('common.logout')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher - Always at the far right */}
            <LanguageSwitcher/>
          </div>
        </div>
      </div>
    </header>
  );
}
