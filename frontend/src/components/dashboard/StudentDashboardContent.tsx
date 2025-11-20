import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { userAPI } from '~/services/UserAPI';
import { studentAPI } from '~/services/StudentAPI';
import CVUploadSection from './CVUploadSection';
import CVStatusCard from './CVStatusCard';
import StatisticsCard from './StatisticsCard';
import SortButton from "~/components/dashboard/SortButton";
import SortMenuOffers from "~/components/dashboard/SortMenuOffers";
import FilterButton from "~/components/dashboard/FilterButton";
import FilterMenuOffers from "~/components/dashboard/FilterMenuOffers";
import OfferList from "~/components/dashboard/OfferList";
import DashboardSidebar from './DashboardSidebar';
import InternshipContractDetailsModal from './InternshipContractDetailsModal';
import type {InternshipOffer, InternshipContract} from "~/interfaces";
import {dashboardService} from "~/services/dashboardService";
import { filterInternshipOffers, sortInternshipOffers } from '~/utils/filterUtils';
import { useClickOutside } from '~/hooks/useClickOutside';


export default function StudentDashboardContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [cvStatus, setCvStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [cvFileName, setCvFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [allOffers, setAllOffers] = useState<InternshipOffer[]>([]);
    const [filteredOffers, setFilteredOffers] = useState<InternshipOffer[]>([]);
    const [showSortMenuOffers, setShowSortMenuOffers] = useState(false);
    const [showFilterMenuOffers, setShowFilterMenuOffers] = useState(false);
    const [applications, setApplications] = useState<any[]>([]);
    const [offerFilters, setOfferFilters] = useState<string[]>([]);
    const [offerSortBy, setOfferSortBy] = useState<string>('');
    const [contracts, setContracts] = useState<InternshipContract[]>([]);
    const [loadingContracts, setLoadingContracts] = useState(false);
    const [selectedContract, setSelectedContract] = useState<InternshipContract | null>(null);
    const [contractsMap, setContractsMap] = useState<Map<number, InternshipContract>>(new Map());

  // Refs pour les dropdowns
  const sortOffersMenuRef = useRef<HTMLDivElement>(null);
  const filterOffersMenuRef = useRef<HTMLDivElement>(null);

  // Fermer les dropdowns quand on clique à l'extérieur
  useClickOutside(sortOffersMenuRef, () => {
    setShowSortMenuOffers(false);
  });

  useClickOutside(filterOffersMenuRef, () => {
    setShowFilterMenuOffers(false);
  });

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!userAPI.isAuthenticated()) {
      navigate('/login');
    } else {
      loadCVStatus();
      loadOffers();
      loadApplications();
    }
  }, [navigate]);

  // Charger les contrats une fois que les offres sont chargées
  useEffect(() => {
    if (allOffers.length > 0) {
      loadContracts();
    }
  }, [allOffers.length]);


    const loadOffers = async () => {
        try {
            setLoading(true);

          const response = await dashboardService.StudentGetAllInternshipOffers();
            if (response.success && response.data) {
                setAllOffers(response.data);
                // Les contrats seront rechargés automatiquement par le useEffect qui surveille allOffers
            }
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    // Apply filters and sorting to offers
    useEffect(() => {
        let filtered = allOffers;
        
        // Exclure les offres où l'étudiant a déjà postulé (pour la section "Offres de stage")
        if (activeTab === 'offers') {
            filtered = filtered.filter(offer => !offer.applicationStatus);
        }
        
        // Apply filters
        const program = offerFilters[0];
        const jobTitle = offerFilters[1];
        const minSalary = offerFilters[2];
        const maxSalary = offerFilters[3];
        const startDateFrom = offerFilters[4];
        const startDateTo = offerFilters[5];
        
        if (program || jobTitle || minSalary || maxSalary || startDateFrom || startDateTo) {
            filtered = filterInternshipOffers(filtered, {
                program,
                title: jobTitle,
                minSalary,
                maxSalary,
                startDateFrom,
                startDateTo
            });
        }
        
        // Apply sorting
        if (offerSortBy) {
            filtered = sortInternshipOffers(filtered, offerSortBy, true);
        }
        
        setFilteredOffers(filtered);
    }, [allOffers, offerFilters, offerSortBy, activeTab]);

  // Charger le statut du CV depuis le backend
  const loadCVStatus = async () => {
    try {
      const response = await studentAPI.getCVStatus();
      console.log('🔍 Dashboard CV status response:', response);
      if (response.success && response.data) {
        console.log('🔍 Setting CV status to:', response.data.status);
        setCvStatus(response.data.status as 'none' | 'pending' | 'approved' | 'rejected');
        setCvFileName(response.data.fileName || null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du statut du CV:', error);
    }
  };

  // Charger les candidatures de l'étudiant
  const loadApplications = async () => {
    try {
      const studentId = await userAPI.getStudentIdFromJWT();
      if (studentId) {
        const response = await studentAPI.getStudentApplications(studentId);
        if (response.success && response.data) {
          setApplications(response.data);
        } else {
          // Ne pas afficher d'erreur si les candidatures ne peuvent pas être chargées
          console.log('Applications not loaded, using empty array');
          setApplications([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
      // Ne pas bloquer le dashboard si les candidatures ne peuvent pas être chargées
      setApplications([]);
    }
  };

  // Charger les contrats de l'étudiant
  const loadContracts = useCallback(async () => {
    try {
      setLoadingContracts(true);
      // Récupérer tous les contrats depuis les offres où l'étudiant a postulé
      const contractsList: InternshipContract[] = [];
      const contractsMapLocal = new Map<number, InternshipContract>();
      
      // Pour chaque offre où l'étudiant a postulé, essayer de charger le contrat
      // Priorité aux offres avec PENDING_CONTRACT ou ACCEPTED_BY_STUDENT
      if (allOffers.length > 0) {
        // Charger les contrats en parallèle pour améliorer les performances
        const contractPromises = allOffers
          .filter(offer => offer.applicationStatus && offer.id)
          .map(async (offer) => {
            if (!offer.id) return null;
            try {
              const response = await studentAPI.getInternshipContract(offer.id);
              if (response.success && response.data) {
                return { offerId: offer.id, contract: response.data };
              }
              return null;
            } catch (err) {
              // Ignorer les erreurs pour les contrats qui n'existent pas encore
              console.log(`Contract not found for offer ${offer.id}:`, err);
              return null;
            }
          });
        
        const contractResults = await Promise.all(contractPromises);
        
        contractResults.forEach(result => {
          if (result && result.contract) {
            contractsList.push(result.contract);
            contractsMapLocal.set(result.offerId, result.contract);
            console.log(`✅ Contract loaded for offer ${result.offerId}`);
          }
        });
      }
      
      console.log(`📋 Loaded ${contractsList.length} contracts, map size: ${contractsMapLocal.size}`);
      setContracts(contractsList);
      setContractsMap(contractsMapLocal);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
      setContracts([]);
      setContractsMap(new Map());
    } finally {
      setLoadingContracts(false);
    }
  }, [allOffers]);

  // Recharger les contrats quand on change vers l'onglet "contracts" ou quand allOffers change
  useEffect(() => {
    if (allOffers.length > 0 && (activeTab === 'contracts' || activeTab === 'applications')) {
      loadContracts();
    }
  }, [activeTab, allOffers.length, loadContracts]);

    // Calculer les statistiques pour l'étudiant
    const getStudentStats = () => {
        const totalApplications = applications.length;
        const pendingApplications = applications.filter(app => 
          app.applicationStatus === 'PENDING' || app.applicationStatus === 'pending'
        ).length;
        const interviewApplications = applications.filter(app => 
          app.applicationStatus === 'PENDING_INTERVIEW' || app.applicationStatus === 'pending_interview'
        ).length;
        const approvedApplications = applications.filter(app => 
          app.applicationStatus === 'ACCEPTED' || 
          app.applicationStatus === 'accepted' ||
          app.applicationStatus === 'ACCEPTED_BY_STUDENT' ||
          app.applicationStatus === 'accepted_by_student'
        ).length;
        
        return {
            applications: pendingApplications, // Seules les candidatures en attente (pas d'entrevue)
            pendingApplications: interviewApplications, // Candidatures avec entrevue planifiée
            approvedApplications: approvedApplications
        };
    };

  const stats = getStudentStats();

  const handleCVUpload = async (file: File) => {
    try {
      console.log('Téléversement du CV:', file.name);

      // Vérifier le type de fichier
      if (file.type !== 'application/pdf') {
        alert(t('student.pdfOnlyError'));
        return;
      }

      // Vérifier la taille du fichier (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(t('student.fileTooLargeError'));
        return;
      }

      // Appel API réel
      const response = await studentAPI.uploadCV(file);

      if (response.success) {
        setCvFileName(file.name);
        setCvStatus('pending');
        console.log('✅ CV téléversé avec succès:', response.data);

        // Recharger le statut depuis le backend pour s'assurer de la cohérence
        await loadCVStatus();
      } else {
        console.error('❌ Erreur lors du téléversement:', response.error);
        alert(`${t('student.uploadError')}: ${response.error}`);
      }

    } catch (error) {
      console.error('Erreur lors du téléversement du CV:', error);
      alert(t('student.serverConnectionError'));
    }
  };

  // Callback pour rafraîchir les données après une candidature réussie
  const handleApplicationSuccess = (offerId: number) => {
    loadOffers();
    loadApplications(); // Recharger les candidatures pour mettre à jour les statistiques
    loadContracts(); // Recharger les contrats
  };

  // Helper function pour obtenir le texte traduit et les styles pour chaque statut
  const getApplicationStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          text: t('student.pending'),
          textColor: 'text-amber-600',
          badgeClasses: 'border-amber-200 bg-amber-50 text-amber-700'
        };
      case 'PENDING_INTERVIEW':
        return {
          text: t('student.pendingInterview'),
          textColor: 'text-amber-600',
          badgeClasses: 'border-amber-200 bg-amber-50 text-amber-700'
        };
      case 'PENDING_CONTRACT':
        return {
          text: t('student.pendingContract'),
          textColor: 'text-blue-600',
          badgeClasses: 'border-blue-200 bg-blue-50 text-blue-700'
        };
      case 'APPROVED':
        return {
          text: t('student.approved'),
          textColor: 'text-emerald-600',
          badgeClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700'
        };
      case 'ACCEPTED':
      case 'ACCEPTED_BY_STUDENT':
        return {
          text: t('student.accepted'),
          textColor: 'text-emerald-600',
          badgeClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700'
        };
      case 'REJECTED':
      case 'REJECTED_BY_STUDENT':
        return {
          text: t('student.rejected'),
          textColor: 'text-red-600',
          badgeClasses: 'border-red-200 bg-red-50 text-red-700'
        };
      default:
        return {
          text: status,
          textColor: 'text-slate-600',
          badgeClasses: 'border-slate-200 bg-slate-50 text-slate-700'
        };
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
             <>
             <div className="mx-auto flex min-h-screen w-full min-w-[320px] flex-col bg-slate-100 lg:ps-96">
                 <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                 
                 <main id="page-content" className="flex max-w-full flex-auto flex-col pt-20 lg:pt-0 bg-slate-100">
              <div className="mx-auto w-full xl:max-w-7xl bg-slate-100">
                  {/* En-tête du dashboard étudiant - en dehors du conteneur blanc */}
                  <div className="mx-auto px-4 sm:px-0 pt-6 pb-3 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
                      <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed">{t('student.dashboardSubtitle')}</p>
                  </div>
                  
                  <div className="mx-auto px-4 sm:px-0 pt-4 pb-8 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl space-y-8">

                  {/* Contenu selon l'onglet actif */}
                  {activeTab === 'overview' && (
                      <>
              {/* Cartes de statistiques */}
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 md:gap-6">
                              <div className="sm:col-span-6 xl:col-span-4">
                  <StatisticsCard
                      title={t('student.applications')}
                      value={stats.applications}
                      icon={statsIcons.applications}
                      bgColor="bg-purple-100"
                      iconColor="text-purple-600"
                  />
                              </div>
                              <div className="sm:col-span-6 xl:col-span-4">
                  <StatisticsCard
                      title={t('student.interviewsPlanned')}
                      value={stats.pendingApplications}
                      icon={statsIcons.pendingApplications}
                      bgColor="bg-yellow-100"
                      iconColor="text-yellow-600"
                  />
                              </div>
                              <div className="sm:col-span-6 xl:col-span-4">
                  <StatisticsCard
                      title={t('student.accepted')}
                      value={stats.approvedApplications}
                      icon={statsIcons.approvedApplications}
                      bgColor="bg-green-100"
                      iconColor="text-green-600"
                  />
              </div>
              </div>

              {/* Navigation rapide */}
                          <div className="rounded-lg border border-slate-200 bg-white p-6">
                              <h2 className="text-xl font-bold text-slate-900 mb-4">Navigation rapide</h2>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <button
                                      onClick={() => setActiveTab('cv')}
                                      className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                                  >
                                      <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                                              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                          </div>
                                          <span className="font-semibold text-slate-900">{t('student.cv')}</span>
                                      </div>
                                      <p className="text-sm text-slate-600 text-left">
                                          {cvStatus === 'approved' ? 'CV approuvé' : cvStatus === 'pending' ? 'CV en validation' : 'Téléverser votre CV'}
                                      </p>
                                  </button>

                                  <button
                                      onClick={() => setActiveTab('offers')}
                                      className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                      disabled={cvStatus !== 'approved'}
                                  >
                                      <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                              </svg>
                                          </div>
                                          <span className="font-semibold text-slate-900">{t('student.offers')}</span>
                                      </div>
                                      <p className="text-sm text-slate-600 text-left">
                                          {allOffers.filter(o => !o.applicationStatus).length} offres disponibles
                                      </p>
                                  </button>

                                  <button
                                      onClick={() => setActiveTab('applications')}
                                      className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                                  >
                                      <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                              </svg>
                                          </div>
                                          <span className="font-semibold text-slate-900">{t('student.applications')}</span>
                                      </div>
                                      <p className="text-sm text-slate-600 text-left">
                                          {(() => {
                                              // Compter les candidatures actives (exclure celles avec contrat)
                                              const activeApplications = allOffers.filter(offer => {
                                                  if (!offer.applicationStatus) return false;
                                                  
                                                  // Exclure si le statut est PENDING_CONTRACT (contrat créé)
                                                  if (offer.applicationStatus === 'PENDING_CONTRACT') {
                                                      return false;
                                                  }
                                                  
                                                  // Exclure si un contrat existe dans contractsMap
                                                  if (offer.id && contractsMap.has(offer.id)) {
                                                      return false;
                                                  }
                                                  
                                                  return true;
                                              }).length;
                                              
                                              return `${activeApplications} candidature${activeApplications > 1 ? 's' : ''} active${activeApplications > 1 ? 's' : ''}`;
                                          })()}
                                      </p>
                                  </button>

                                  <button
                                      onClick={() => setActiveTab('contracts')}
                                      className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                                  >
                                      <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                          </div>
                                          <span className="font-semibold text-slate-900">{t('student.contracts')}</span>
                                      </div>
                                      <p className="text-sm text-slate-600 text-left">
                                          {contracts.length} entente{contracts.length > 1 ? 's' : ''} de stage
                                      </p>
                                  </button>
                              </div>
                          </div>

              {/* Section d'information pour les étudiants */}
                          <div className="rounded-lg border border-slate-200 bg-white p-6">
                              <h2 className="text-xl font-bold text-slate-900 mb-4">{t('student.importantInfo')}</h2>
                  <div className="space-y-4">
                                  <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                                          <svg className="w-5 h-5 text-indigo-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                          </div>
                          <div>
                                          <p className="text-sm font-medium text-slate-700">
                                              <strong className="text-slate-900">{t('student.cvRequired')}</strong> {t('student.cvRequiredDesc')}
                              </p>
                          </div>
                      </div>
                                  <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                                          <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                          </div>
                          <div>
                                          <p className="text-sm font-medium text-slate-700">
                                              <strong className="text-slate-900">{t('student.acceptedFormat')}</strong> {t('student.acceptedFormatDesc')}
                              </p>
                          </div>
                      </div>
                                  <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                                          <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                          </div>
                          <div>
                                          <p className="text-sm font-medium text-slate-700">
                                              <strong className="text-slate-900">{t('student.validation')}</strong> {t('student.validationDesc')}
                              </p>
                          </div>
                      </div>
                              </div>
                          </div>
                      </>
                  )}

                  {activeTab === 'cv' && (
                      <>
                          {/* Section de statut du CV */}
                          <div>
                              <CVStatusCard
                                  status={cvStatus}
                                  fileName={cvFileName}
                                  onStatusChange={setCvStatus}
                              />
                  </div>

                          {/* Section de téléversement de CV */}
                          <div>
                              <CVUploadSection
                                  onCVUpload={handleCVUpload}
                                  disabled={cvStatus === 'pending'}
                              />
              </div>
                      </>
            )}

                  {activeTab === 'offers' && cvStatus === 'approved' && (
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <div className="px-6 pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                  <div>
                                      <h2 className="text-xl font-bold text-slate-900">{t("im.internshipOffersSection")}</h2>
                                      <p className="text-sm font-medium text-slate-500 mt-1">{t("student.offers")}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                              <div className="relative" ref={sortOffersMenuRef}>
                                  <SortButton onClick={() => {
                                      setShowSortMenuOffers(!showSortMenuOffers)
                                      setShowFilterMenuOffers(false)
                                  }} />
                                  {showSortMenuOffers &&
                                      <SortMenuOffers
                                          userRole="STUDENT"
                                          applySorting={(sortBy: string) => {
                                              setShowSortMenuOffers(false);
                                              setOfferSortBy(sortBy);
                                          }}/>
                                  }
                              </div>
                              <div className="relative" ref={filterOffersMenuRef}>
                                  <FilterButton onClick={() => {
                                      setShowSortMenuOffers(false)
                                      setShowFilterMenuOffers(!showFilterMenuOffers)
                                  }}/>
                                  {showFilterMenuOffers &&
                                      <FilterMenuOffers
                                          userRole="STUDENT"
                                          applyFilters={(filterBy: string[]) => {
                                              setShowFilterMenuOffers(false);
                                              setOfferFilters(filterBy);
                                          }}/>
                                  }
                              </div>
                          </div>
                      </div>
                          </div>
                          <div className="p-6">
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={loading}
          offers={filteredOffers}
          numbersOfApplications={[]}
          onOfferValidation={() => loadOffers()}
          onApplicationSuccess={handleApplicationSuccess}
          cvStatus={cvStatus}
        />
                          </div>
                  </div>
              )}

                  {activeTab === 'offers' && cvStatus !== 'approved' && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
                          <p className="text-sm font-medium text-amber-700">
                              {cvStatus === 'pending' 
                                  ? t('student.cvPendingMessage')
                                  : t('student.cvRequiredMessage')}
                          </p>
          </div>
                  )}

                  {activeTab === 'applications' && (
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <div className="px-6 pt-6">
                              <h2 className="text-xl font-bold text-slate-900">{t('student.myApplications')}</h2>
                              <p className="text-sm font-medium text-slate-500 mt-1">{t('student.myApplicationsSubtitle')}</p>
                          </div>
                          <div className="p-6">
                              {(() => {
                                  // Filtrer les offres où l'étudiant a postulé
                                  // Exclure celles qui ont un contrat créé (même s'il n'est pas encore signé)
                                  // Le statut PENDING_CONTRACT indique qu'un contrat a été créé
                                  const appliedOffersList = allOffers.filter(offer => {
                                      if (!offer.applicationStatus) return false;
                                      
                                      // Si le statut est PENDING_CONTRACT, cela signifie qu'un contrat a été créé
                                      // même s'il n'est pas encore chargé dans contractsMap
                                      if (offer.applicationStatus === 'PENDING_CONTRACT') {
                                          return false; // Exclure de Candidatures, aller dans Ententes de stage
                                      }
                                      
                                      // Vérifier si cette offre a un contrat créé dans contractsMap
                                      if (offer.id) {
                                          const contract = contractsMap.get(offer.id);
                                          if (contract) {
                                              // Contrat créé - ne pas afficher dans Candidatures, seulement dans Ententes de stage
                                              return false;
                                          }
                                      }
                                      
                                      // Si pas de contrat créé (pas de statut PENDING_CONTRACT et pas dans contractsMap)
                                      // l'offre reste dans Candidatures, même si le statut est ACCEPTED_BY_STUDENT
                                      return true;
                                  });
                                  
                                  if (appliedOffersList.length === 0) {
                                      return (
                                          <p className="text-sm font-medium text-slate-500 text-center py-8">
                                              {t('student.noApplications')}
                                          </p>
                                      );
                                  }
                                  
                                  return (
                                      <OfferList
                                          isStudent={true}
                                          isEmployer={false}
                                          loading={loading}
                                          offers={appliedOffersList}
                                          numbersOfApplications={[]}
                                          onOfferValidation={() => loadOffers()}
                                          onApplicationSuccess={handleApplicationSuccess}
                                          cvStatus={cvStatus}
                                      />
                                  );
                              })()}
                          </div>
                      </div>
                  )}

                  {activeTab === 'contracts' && (
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <div className="px-6 pt-6">
                              <h2 className="text-xl font-bold text-slate-900">{t('student.contracts')}</h2>
                              <p className="text-sm font-medium text-slate-500 mt-1">{t('student.contractsSubtitle')}</p>
                          </div>
                          <div className="p-6">
                              {loadingContracts ? (
                                  <div className="text-center p-6">
                                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                      <p className="mt-2 text-sm font-medium text-slate-500">{t('common.loading')}</p>
                                  </div>
                              ) : (() => {
                                  // Récupérer tous les contrats chargés + les offres avec PENDING_CONTRACT qui n'ont pas encore de contrat chargé
                                  const allContractsToDisplay: Array<{contract: InternshipContract | null, offer: InternshipOffer}> = [];
                                  
                                  // Ajouter tous les contrats chargés
                                  contracts.forEach(contract => {
                                      const offer = allOffers.find(o => o.id === contract.internshipOfferId);
                                      if (offer) {
                                          allContractsToDisplay.push({ contract, offer });
                                      }
                                  });
                                  
                                  // Ajouter les offres avec PENDING_CONTRACT qui ont un contrat
                                  // mais qui n'ont pas encore été ajoutées (car le contrat n'est pas encore chargé)
                                  // NOTE: On n'ajoute PAS les offres avec ACCEPTED_BY_STUDENT si le contrat n'existe pas encore
                                  // car ACCEPTED_BY_STUDENT signifie que l'étudiant a accepté, mais le contrat n'a pas encore été créé par le gestionnaire
                                  allOffers.forEach(offer => {
                                      // Seulement PENDING_CONTRACT indique qu'un contrat a été créé par le gestionnaire
                                      if (offer.applicationStatus === 'PENDING_CONTRACT' && offer.id) {
                                          const existingContract = contractsMap.get(offer.id);
                                          const alreadyAdded = allContractsToDisplay.some(item => item.offer.id === offer.id);
                                          if (!existingContract && !alreadyAdded) {
                                              // Offre avec PENDING_CONTRACT mais contrat pas encore chargé
                                              // On l'ajoute quand même pour l'afficher (le contrat existe, il est juste en cours de chargement)
                                              allContractsToDisplay.push({ contract: null, offer });
                                          }
                                      }
                                  });
                                  
                                  if (allContractsToDisplay.length === 0) {
                                      return (
                                          <p className="text-sm font-medium text-slate-500 text-center py-8">
                                              {t('student.noContracts')}
                                          </p>
                                      );
                                  }
                                  
                                  return (
                                      <div className="space-y-4">
                                          {allContractsToDisplay.map(({ contract, offer }, index) => {
                                              // Si le contrat n'est pas encore chargé, essayer de le charger au clic
                                              const handleViewContract = async () => {
                                                  if (!contract && offer.id) {
                                                      try {
                                                          const response = await studentAPI.getInternshipContract(offer.id);
                                                          if (response.success && response.data) {
                                                              setSelectedContract(response.data);
                                                              // Recharger les contrats pour mettre à jour la liste
                                                              loadContracts();
                                                          } else {
                                                              // Si le contrat n'existe toujours pas, afficher un message
                                                              alert(t('internshipContract.errors.loadError') || 'Le contrat n\'est pas encore disponible');
                                                          }
                                                      } catch (error) {
                                                          console.error('Error loading contract:', error);
                                                          alert(t('internshipContract.errors.loadError') || 'Erreur lors du chargement du contrat');
                                                      }
                                                  } else if (contract) {
                                                      setSelectedContract(contract);
                                                  }
                                              };
                                              
                                              return (
                                                  <div key={contract?.id || offer.id || index} className="rounded-lg border border-slate-200 bg-white p-6 hover:bg-slate-50 transition-colors">
                                                      <div className="flex-1">
                                                          <div className="flex items-start justify-between mb-4">
                                                              <div className="flex-1">
                                                                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                                                      {offer?.title || t('student.contractTitle')}
                                                                  </h3>
                                                                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                                                                      {offer?.address && (
                                                                          <div className="flex items-center">
                                                                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                              </svg>
                                                                              {offer.address}
                                                                          </div>
                                                                      )}
                                                                      {contract?.startDate && contract?.endDate && (
                                                                          <div className="flex items-center">
                                                                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                              </svg>
                                                                              {contract.startDate} - {contract.endDate}
                                                                          </div>
                                                                      )}
                                                                      {offer?.startDate && offer?.endDate && !contract && (
                                                                          <div className="flex items-center">
                                                                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                              </svg>
                                                                              {offer.startDate} - {offer.endDate}
                                                                          </div>
                                                                      )}
                                                                  </div>
                                                              </div>
                                                              <div className="ml-4">
                                                                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                                                      contract && contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager
                                                                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                          : 'border-amber-200 bg-amber-50 text-amber-700'
                                                                  }`}>
                                                                      {contract && contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager
                                                                          ? t('internshipContract.fullySigned')
                                                                          : t('internshipContract.pendingSignatures')}
                                                                  </span>
                                                              </div>
                                                          </div>
                                                          <div className="flex items-start justify-between gap-4">
                                                              <div className="flex-1">
                                                                  {contract ? (
                                                                      <span className="text-sm text-slate-600">
                                                                          {t('internshipContract.student')}: {contract.isSignedStudent ? t('internshipContract.signed') : t('internshipContract.notSigned')} • {t('internshipContract.employer')}: {contract.isSignedEmployer ? t('internshipContract.signed') : t('internshipContract.notSigned')} • {t('internshipContract.internshipManager')}: {contract.isSignedInternshipManager ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                                                                      </span>
                                                                  ) : (
                                                                      <span className="text-sm text-slate-600">
                                                                          {t('internshipContract.pendingSignatures')}
                                                                      </span>
                                                                  )}
                                                              </div>
                                                              <div className="flex items-center flex-shrink-0">
                                                                  <button
                                                                      onClick={handleViewContract}
                                                                      className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                                                                  >
                                                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                      </svg>
                                                                      {t('internshipContract.viewContract')}
                                                                  </button>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  );
                              })()}
                          </div>
                      </div>
                  )}
                  </div>
              </div>
      </main>
      </div>

      {/* Modal de détails du contrat */}
      {selectedContract && (
        <InternshipContractDetailsModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onContractUpdate={async () => {
            // Recharger le contrat après signature
            if (selectedContract && selectedContract.internshipOfferId) {
              try {
                const response = await studentAPI.getInternshipContract(selectedContract.internshipOfferId);
                if (response.success && response.data) {
                  setSelectedContract(response.data);
                  loadContracts(); // Recharger la liste des contrats
                }
              } catch (error) {
                console.error('Error reloading contract:', error);
              }
            }
          }}
        />
      )}
      </>
  );
}
