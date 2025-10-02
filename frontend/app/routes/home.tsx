import type { Route } from "./+types/home";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiService } from "../services/apiService";

export function meta({}: Route.MetaArgs) {
  // Note: Pour une internationalisation complète des métadonnées,
  // il faudrait implémenter i18n côté serveur
  return [
    { title: "InternOSE - Accueil" },
    { name: "description", content: "Plateforme de stages pour employeurs et étudiants" },
  ];
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Rediriger automatiquement vers le bon dashboard si l'utilisateur est connecté
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      const userRole = apiService.getUserRole();
      if (userRole === 'EMPLOYER') {
        navigate('/employer-dashboard');
      } else if (userRole === 'STUDENT') {
        navigate('/student-dashboard');
      } else if (userRole === 'INTERNSHIP-MANAGER') {
        navigate('/im-dashboard');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <main className="flex-1 bg-white">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-6xl mx-auto px-4">
            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('home.welcome')}{" "}
              <span className="text-purple-600">
                InternOSE
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t('home.cta.getStarted')}
              </a>
              <a
                href="/login"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                {t('common.login')}
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
              {t('home.features.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 - Students */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('home.features.forStudents.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.features.forStudents.description')}
                </p>
              </div>

              {/* Feature 2 - Employers */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('home.features.forEmployers.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.features.forEmployers.description')}
                </p>
              </div>

              {/* Feature 3 - Easy to use */}
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('home.features.easyToUse.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.features.easyToUse.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
