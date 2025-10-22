import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { apiService } from '~/services/apiService';
import CVUploadSection from './CVUploadSection';
import CVStatusCard from './CVStatusCard';
import StatisticsCard from './StatisticsCard';
import SortButton from "~/components/dashboard/SortButton";
import SortMenuOffers from "~/components/dashboard/SortMenuOffers";
import FilterButton from "~/components/dashboard/FilterButton";
import FilterMenuOffers from "~/components/dashboard/FilterMenuOffers";
import OfferList from "~/components/dashboard/OfferList";
import type {InternshipOffer} from "~/interfaces";
import {dashboardService} from "~/services/dashboardService";

export default function StudentDashboardContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cvStatus, setCvStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [offers, setOffers] = useState<InternshipOffer[]>([]);
    const [showSortMenuOffers, setShowSortMenuOffers] = useState(false);
    const [showSortMenuResumes, setShowSortMenuResumes] = useState(false);
    const [showFilterMenuOffers, setShowFilterMenuOffers] = useState(false);
    const [showFilterMenuResumes, setShowFilterMenuResumes] = useState(false);
    const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
    } else {
      loadCVStatus();
      loadOffers();
    }
  }, [navigate]);

    const loadOffers = async (sortBy?: string, filterBy?: string[]) => {
        try {
            setLoading(true);

          const response = await dashboardService.StudentGetAllInternshipOffers(sortBy, filterBy);
            console.log(response.data);
            if (response.success && response.data) {
                setOffers(response.data);
            } else {
                setError(response.error || t('dashboard.loadingError'));
            }
        } catch (err) {
            setError(t('dashboard.serverError'));
        } finally {
            setLoading(false);
        }
    };

  // Charger le statut du CV depuis le backend
  const loadCVStatus = async () => {
    try {
      const response = await apiService.getCVStatus();
      if (response.success && response.data) {
        setCvStatus(response.data.status as 'none' | 'pending' | 'approved' | 'rejected');
        setCvFileName(response.data.fileName || null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du statut du CV:', error);
    }
  };

    // Calculer les statistiques pour l'étudiant
    const getStudentStats = () => {
        return {
            applications: 0, // À implémenter plus tard
            pendingApplications: 0, // À implémenter plus tard
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

        // Recharger le statut depuis le backend pour s'assurer de la cohérence
        await loadCVStatus();
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
                  </div>
              </div>

              {/* Cartes de statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatisticsCard
                      title={t('student.applications')}
                      value={stats.applications}
                      icon={statsIcons.applications}
                      bgColor="bg-purple-100"
                      iconColor="text-purple-600"
                  />
                  <StatisticsCard
                      title={t('student.interviewsPlanned')}
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
              <div className="mb-8">
                  <CVUploadSection
                      onCVUpload={handleCVUpload}
                      disabled={cvStatus === 'pending'}
                  />
              </div>

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
            {(cvStatus === 'pending') && (
              <div className="bg-white rounded-lg shadow-md mb-8 p-6 mt-8"></div>
            )}

              {(cvStatus === 'approved') && (
                  <div className="bg-white rounded-lg shadow-md mb-8 p-6 mt-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                          <h2 className="text-xl font-semibold text-gray-900">
                              {t("im.internshipOffersSection")}
                          </h2>
                        <p>amogus</p>
                          <div className="flex items-center space-x-4">
                              <div className="relative">
                                  <SortButton onClick={() => {
                                      setShowSortMenuOffers(!showSortMenuOffers)
                                      setShowFilterMenuOffers(false)
                                      setShowSortMenuResumes(false)
                                      setShowFilterMenuResumes(false)
                                  }} />
                                  {showSortMenuOffers &&
                                      <SortMenuOffers
                                          userRole="STUDENT"
                                          applySorting={(sortBy: string) => {
                                              setShowSortMenuOffers(false);
                                              loadOffers(sortBy, undefined);
                                          }}/>
                                  }
                              </div>
                              <div className="relative">
                                  <FilterButton onClick={() => {
                                      setShowSortMenuOffers(false)
                                      setShowFilterMenuOffers(!showFilterMenuOffers)
                                      setShowSortMenuResumes(false)
                                      setShowFilterMenuResumes(false)
                                  }}/>
                                  {showFilterMenuOffers &&
                                      <FilterMenuOffers
                                          userRole="STUDENT"
                                          applyFilters={(filterBy: string[]) => {
                                              setShowFilterMenuOffers(false);
                                              loadOffers(undefined, filterBy);
                                          }}/>
                                  }
                              </div>
                          </div>
                      </div>
                      <OfferList
                          isStudent={true}
                          isEmployer={false}
                          loading={loading}
                          offers={offers}
                          onOfferValidation={() => loadOffers()}
                          cvStatus={cvStatus}
                      />
                  </div>
              )}

          </div>
      </main>
  );
}
