import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/apiService';
import PageLayout from '../components/PageLayout';

export function meta() {
  return [
    { title: "Dashboard Gestionnaire de Stage - InternOSE" },
    { name: "description", content: "Tableau de bord pour les gestionnaires de stage" },
  ];
}

export default function InternshipManagerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
    } else {
      const userRole = apiService.getUserRole();
      if (userRole !== 'INTERNSHIP_MANAGER') {
        // Rediriger vers le bon dashboard selon le rôle
        if (userRole === 'STUDENT') {
          navigate('/student-dashboard');
        } else if (userRole === 'EMPLOYER') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    }
  }, [navigate]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Gestionnaire de Stage
            </h1>
            <p className="mt-2 text-gray-600">
              Gérez les candidatures et validez les CVs des étudiants
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CVs en attente</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CVs validés</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CVs rejetés</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section principale */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Gestion des CVs des étudiants
            </h2>
            <p className="text-gray-600">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez consulter et valider les CVs des étudiants.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}