import { Link } from "react-router";
import { useState, useRef } from "react";
import { apiService } from "../services/apiService";
import { useAuth, useClickOutside } from "../hooks";

export default function Header() {
  const { isAuthenticated, userRole, userEmail } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setShowUserMenu(false));

  return (
    <header className="bg-gray-50 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">InternOSE</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {!isAuthenticated && (
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 px-4 py-3 rounded-md text-base font-semibold transition-colors hover:bg-gray-100"
              >
                Accueil
              </Link>
            )}
            {isAuthenticated && userRole === 'EMPLOYER' && (
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-blue-600 px-4 py-3 rounded-md text-base font-semibold transition-colors hover:bg-gray-100"
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && userRole === 'STUDENT' && (
              <Link 
                to="/student-dashboard" 
                className="text-gray-700 hover:text-blue-600 px-4 py-3 rounded-md text-base font-semibold transition-colors hover:bg-gray-100"
              >
                Mon Espace
              </Link>
            )}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  S'inscrire
                </Link>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Connexion
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Menu déroulant utilisateur */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span className="font-medium">
                      {userRole === 'EMPLOYER' ? 'Employeur' : 'Étudiant'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Menu déroulant */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {userRole === 'EMPLOYER' ? 'Employeur' : 'Étudiant'}
                            </p>
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
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
