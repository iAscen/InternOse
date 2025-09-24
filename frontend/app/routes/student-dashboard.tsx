import React from 'react';
import { useNavigate } from 'react-router';
import { apiService } from '../services/apiService';
import PageLayout from '../components/PageLayout';
import Footer from '../components/Footer';

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  React.useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    apiService.removeToken();
    navigate('/login');
  };

  return (
    <PageLayout>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête du dashboard étudiant */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord étudiant</h1>
              <p className="text-gray-600 mt-2">Bienvenue dans votre espace personnel</p>
            </div>
          </div>

          {/* Message "Bientôt disponible" */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="max-w-2xl mx-auto">
              {/* Icône ou illustration */}
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Service bientôt disponible
              </h2>
              
              <p className="text-lg text-gray-600 mb-6">
                Nous travaillons activement sur votre espace étudiant. 
                Bientôt, vous pourrez :
              </p>

              <div className="text-left max-w-md mx-auto mb-8">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Consulter les offres de stage disponibles
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Postuler aux stages qui vous intéressent
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Suivre l'état de vos candidatures
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Gérer votre profil et vos préférences
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <strong>En attendant :</strong> Les employeurs peuvent déjà créer des offres de stage 
                  qui seront disponibles dès que votre espace sera prêt !
                </p>
              </div>

            </div>
          </div>

          {/* Section d'information supplémentaire */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              À propos de votre compte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Votre profil</h4>
                <p className="text-sm text-gray-600">
                  Votre compte étudiant est actif et prêt. Nous vous notifierons 
                  dès que toutes les fonctionnalités seront disponibles.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Support</h4>
                <p className="text-sm text-gray-600">
                  Si vous avez des questions, n'hésitez pas à contacter 
                  le service de gestion des stages de votre établissement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PageLayout>
  );
}
