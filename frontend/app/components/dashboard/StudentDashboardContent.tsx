import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { apiService } from '../../services/apiService';
import ComingSoonMessage from './ComingSoonMessage';
import InfoSection from './InfoSection';

export default function StudentDashboardContent() {
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
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
        <ComingSoonMessage />

        {/* Section d'information supplémentaire */}
        <InfoSection />
      </div>
    </main>
  );
}
