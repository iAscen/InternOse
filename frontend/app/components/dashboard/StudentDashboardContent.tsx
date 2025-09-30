import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';
import CVUploadSection from './CVUploadSection';
import CVStatusCard from './CVStatusCard';
import StatisticsCard from './StatisticsCard';

export default function StudentDashboardContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cvStatus, setCvStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Calculer les statistiques pour l'étudiant
  const getStudentStats = () => {
    return {
      cvStatus: cvStatus === 'approved' ? 1 : 0,
      applications: 0, // À implémenter plus tard
      pendingApplications: cvStatus === 'pending' ? 1 : 0, // Affiche 1 si CV en attente
      approvedApplications: 0 // À implémenter plus tard
    };
  };

  const stats = getStudentStats();

  const handleCVUpload = async (file: File) => {
    try {
      console.log('Téléversement du CV:', file.name);
      
      // Vérifier le type de fichier
      if (file.type !== 'application/pdf') {
        alert('Seuls les fichiers PDF sont acceptés');
        return;
      }
      
      // Vérifier la taille du fichier (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('Le fichier est trop volumineux. Taille maximale : 10MB');
        return;
      }
      
      // Appel API réel
      const response = await apiService.uploadCV(file);
      
      if (response.success) {
        setCvFileName(file.name);
        setCvStatus('pending');
        console.log('✅ CV téléversé avec succès:', response.data);
        
        // Note: Le statut "approved" sera géré par le backend quand il sera implémenté
        // Pour l'instant, on reste en "pending"
      } else {
        console.error('❌ Erreur lors du téléversement:', response.error);
        alert(`Erreur lors du téléversement: ${response.error}`);
      }
      
    } catch (error) {
      console.error('Erreur lors du téléversement du CV:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  // Icônes pour les statistiques
  const statsIcons = {
    cvStatus: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    applications: (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    pendingApplications: (
      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    approvedApplications: (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête du dashboard étudiant */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('student.dashboard')}</h1>
              <p className="text-gray-600 mt-2">{t('student.dashboardSubtitle')}</p>
            </div>
            <div>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showUploadForm ? t('common.cancel') : t('student.uploadMyCV')}
              </button>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatisticsCard
            title={t('student.cvValidated')}
            value={stats.cvStatus}
            icon={statsIcons.cvStatus}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatisticsCard
            title={t('student.applications')}
            value={stats.applications}
            icon={statsIcons.applications}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatisticsCard
            title={t('student.pending')}
            value={stats.pendingApplications}
            icon={statsIcons.pendingApplications}
            bgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatisticsCard
            title={t('student.accepted')}
            value={stats.approvedApplications}
            icon={statsIcons.approvedApplications}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
        </div>

        {/* Section de statut du CV */}
        <div className="mb-8">
          <CVStatusCard 
            status={cvStatus} 
            fileName={cvFileName}
            onStatusChange={setCvStatus}
          />
        </div>

        {/* Section de téléversement de CV */}
        {showUploadForm && (
          <div className="mb-8">
            <CVUploadSection 
              onCVUpload={handleCVUpload}
              disabled={cvStatus === 'pending'}
            />
          </div>
        )}

        {/* Section d'information pour les étudiants */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('student.importantInfo')}</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>{t('student.cvRequired')}</strong> {t('student.cvRequiredDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>{t('student.acceptedFormat')}</strong> {t('student.acceptedFormatDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>{t('student.validation')}</strong> {t('student.validationDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
