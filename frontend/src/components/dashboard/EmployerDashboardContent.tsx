import {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';
import {userAPI} from '../../services/UserAPI';
import {dashboardService} from '../../services/dashboardService';
import StatisticsCard from './StatisticsCard';
import CreateOfferForm from './CreateOfferForm';
import OfferList from './OfferList';
import DashboardSidebar from './DashboardSidebar';
import SortButton from './SortButton';
import SortMenuOffers from './SortMenuOffers';
import FilterButton from './FilterButton';
import FilterMenuOffers from './FilterMenuOffers';
import SortMenuContracts from './SortMenuContracts';
import FilterMenuContracts from './FilterMenuContracts';
import type {CreateInternshipOfferRequest, CreateOfferFormData, InternshipOffer, UnseenApplicationsCount, InternshipContract} from '../../interfaces';
import InternshipApplications from './InternshipApplications';
import {employerAPI} from "~/services/EmployerAPI";
import {useClickOutside} from "~/hooks/useClickOutside";
import {filterInternshipOffers, sortInternshipOffers, filterContracts, sortContracts} from "~/utils/filterUtils";
import InternshipContractList from './InternshipContractList';
import { getAvailableSessions } from "~/utils/avaliableSessions";

export default function EmployerDashboardContent() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [allOffers, setAllOffers] = useState<InternshipOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<InternshipOffer[]>([]);
  const [filteredApprovedOffers, setFilteredApprovedOffers] = useState<InternshipOffer[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<InternshipOffer | null>(null);
  const [numbersOfApplications, setNumbersOfApplications] = useState<Map<number, number>>(new Map());
   const [unseenApplicationsCount, setUnseenApplicationsCount] = useState<Map<number, UnseenApplicationsCount>>(new Map());
  const [showSortMenuOffers, setShowSortMenuOffers] = useState(false);
  const [showFilterMenuOffers, setShowFilterMenuOffers] = useState(false);
  const [showSortMenuContracts, setShowSortMenuContracts] = useState(false);
  const [showFilterMenuContracts, setShowFilterMenuContracts] = useState(false);
  const [offerFilters, setOfferFilters] = useState<string[]>([]);
  const [contractFilters, setContractFilters] = useState<string[]>([]);
  const [offerSortBy, setOfferSortBy] = useState<string>('');
  const [contractSortBy, setContractSortBy] = useState<string>('');
  const [contracts, setContracts] = useState<InternshipContract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [pastOffers, setPastOffers] = useState<InternshipOffer[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState<string>('');
  const [filteredHistoryOffers, setFilteredHistoryOffers] = useState<InternshipOffer[]>([]);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState<number>(0);
  const [interviewApplicationsCount, setInterviewApplicationsCount] = useState<number>(0);

  const availableSessions = useMemo(() => {
    return getAvailableSessions(pastOffers, false);
  }, [pastOffers]);

  useEffect(() => {
    if (availableSessions.length > 0 && !selectedHistorySession) {
      setSelectedHistorySession(availableSessions[0]);
    }
  }, [availableSessions, selectedHistorySession]);

  const sortOffersMenuRef = useRef<HTMLDivElement>(null);
  const filterOffersMenuRef = useRef<HTMLDivElement>(null);
  const sortContractsMenuRef = useRef<HTMLDivElement>(null);
  const filterContractsMenuRef = useRef<HTMLDivElement>(null);

  const countNumberOfUnseenApplications = async (offers: InternshipOffer[]) => {
    const countsMap = new Map<number, UnseenApplicationsCount>();
    
    for (const offer of offers) {
      try {
        const response = await employerAPI.getUnseenApplicationsCount(offer.id);
        countsMap.set(offer.id, response.data!);
      } catch (err) {
        console.error(`Failed to fetch unseen count for offer ${offer.id}`, err);
      }
    }

    setUnseenApplicationsCount(countsMap);
  };

  useClickOutside(sortOffersMenuRef, () => {
    setShowSortMenuOffers(false);
  });

  useClickOutside(filterOffersMenuRef, () => {
    setShowFilterMenuOffers(false);
  });

  useClickOutside(sortContractsMenuRef, () => {
    setShowSortMenuContracts(false);
  });

  useClickOutside(filterContractsMenuRef, () => {
    setShowFilterMenuContracts(false);
  });

  useEffect(() => {
    if (!userAPI.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab !== 'approved-offers' && activeTab !== 'history') {
      setSelectedOffer(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedOffer && (activeTab === 'approved-offers' || activeTab === 'history')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedOffer, activeTab]);

  const loadContracts = useCallback(async () => {
    try {
      setLoadingContracts(true);
      const contractsList: InternshipContract[] = [];
      
      const approvedOffers = allOffers.filter(offer => offer.verificationStatus === 'APPROVED' && offer.id);
      
      if (approvedOffers.length > 0) {
        const contractPromises: Promise<{ contract: InternshipContract | null, offerId: number, studentId: number } | null>[] = [];
        
        for (const offer of approvedOffers) {
          if (!offer.id) continue;
          
          try {
            const applicationsResponse = await employerAPI.getStudentApplicationsBy(offer.id, null, null, null, null);
            if (applicationsResponse.success && applicationsResponse.data) {
              const acceptedApplications = applicationsResponse.data.filter((app: any) => 
                app.applicationStatus === 'ACCEPTED_BY_STUDENT' || app.applicationStatus === 'PENDING_CONTRACT'
              );
              
              for (const app of acceptedApplications) {
                if (app.id && offer.id) {
                  const studentId = app.id;
                  const offerId = offer.id;
                  contractPromises.push(
                    employerAPI.getInternshipContract(offerId, studentId)
                      .then(response => {
                        if (response.success && response.data) {
                          return { contract: response.data, offerId, studentId };
                        }
                        return null;
                      })
                      .catch(() => null)
                  );
                }
              }
            }
          } catch (err) {
          }
        }
        
        const contractResults = await Promise.all(contractPromises);
        
        contractResults.forEach(result => {
          if (result && result.contract) {
            contractsList.push(result.contract);
          }
        });
      }
      
      setContracts(contractsList);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  }, [allOffers]);

  useEffect(() => {
    if (allOffers.length > 0 && activeTab === 'contracts') {
      loadContracts();
    }
  }, [activeTab, allOffers.length, loadContracts]);

  const selectOffer = (offer: InternshipOffer) => {
    if (offer && offer.verificationStatus === "APPROVED") {
      setSelectedOffer(offer);
      if (activeTab !== 'approved-offers' && activeTab !== 'history') {
        setActiveTab('approved-offers');
      }
    }
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getInternshipOffers();

      if (response.success && response.data) {
        setAllOffers(response.data);
        await countNumberOfApplicationsForOffers(response.data);
        await countNumberOfUnseenApplications(response.data);
      } else {
        setError(response.error || t('dashboard.loadingError'));
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(t('dashboard.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const loadPastOffers = async () => {
    try {
      setLoading(true);
      const response = await employerAPI.getPastSessionsInternshipOffers();

      if (response.success && response.data) {
        setPastOffers(response.data);
      } else {
        setError(response.error || t('dashboard.loadingError'));
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(t('dashboard.serverError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = allOffers.filter(offer => !offer.verificationStatus || offer.verificationStatus === 'PENDING');
    
    const program = offerFilters[0];
    const title = offerFilters[1];
    
    if (program || title) {
      filtered = filterInternshipOffers(filtered, {
        program,
        title
      });
    }
    
    if (offerSortBy) {
      filtered = sortInternshipOffers(filtered, offerSortBy, true);
    }
    
    setFilteredOffers(filtered);
  }, [allOffers, offerFilters, offerSortBy]);

  useEffect(() => {
    let filtered = allOffers.filter(offer => offer.verificationStatus === 'APPROVED');
    
    const program = offerFilters[0];
    const title = offerFilters[1];
    
    if (program || title) {
      filtered = filterInternshipOffers(filtered, {
        program,
        title
      });
    }
    
    if (offerSortBy) {
      filtered = sortInternshipOffers(filtered, offerSortBy, true);
    }
    
    setFilteredApprovedOffers(filtered);
  }, [allOffers, offerFilters, offerSortBy]);

  useEffect(() => {
    let filtered = pastOffers;

    if (selectedHistorySession) {
      filtered = filtered.filter(offer => offer.session === selectedHistorySession);
    }

    // Pour l'historique, offerFilters contient seulement [program, title] (pas de status)
    const program = offerFilters[0];
    const title = offerFilters[1];

    if (program || title) {
      filtered = filterInternshipOffers(filtered, {
        program,
        title
      });
    }

    if (offerSortBy) {
      filtered = sortInternshipOffers(filtered, offerSortBy, true);
    }

    setFilteredHistoryOffers(filtered);
  }, [pastOffers, offerFilters, offerSortBy, selectedHistorySession]);

  // Apply filters and sorting to contracts
  const filteredAndSortedContracts = useMemo(() => {
    let filtered = contracts;
    
    // Apply filters
    const status = contractFilters[0];
    const title = contractFilters[1];
    
    if (status || title) {
      filtered = filterContracts(filtered, {
        status,
        title
      });
    }
    
    // Apply sorting
    if (contractSortBy) {
      filtered = sortContracts(filtered, contractSortBy, true);
    }
    
    return filtered;
  }, [contracts, contractFilters, contractSortBy]);

  const countNumberOfApplicationsForOffers = async (offersList: InternshipOffer[], applicationStatus: string | null = null, program: string | null = null, institution: string | null = null, sortBy: string | null = null) => {
    const errorMes = "Erreur lors du comptage des candidatures sur vos offres de stage."
    const numbersOfApplicationsMap = new Map<number, number>();
    try {
      for (const offer of offersList) {
        if (offer.id) {
          let response = await employerAPI.getStudentApplicationsBy(offer.id, applicationStatus, program, institution, sortBy)
          if (response.success) {
            numbersOfApplicationsMap.set(offer.id, response.data!.length);
          } else {
            setError(response.error || errorMes)
            break
          }
        }
      }
      setNumbersOfApplications(numbersOfApplicationsMap);
    } catch (error) {
      setError(errorMes)
    }
  }

  // Compter les candidatures en attente et en entrevue
  const countApplicationStatuses = async () => {
    try {
      let pendingCount = 0;
      let interviewCount = 0;
      
      // Seulement pour les offres approuvées
      const approvedOffers = allOffers.filter(offer => offer.verificationStatus === 'APPROVED' && offer.id);
      
      for (const offer of approvedOffers) {
        if (!offer.id) continue;
        
        try {
          // Récupérer toutes les candidatures pour cette offre
          const response = await employerAPI.getStudentApplicationsBy(offer.id, null, null, null, null);
          if (response.success && response.data) {
            response.data.forEach((app: any) => {
              if (app.applicationStatus === 'PENDING') {
                pendingCount++;
              } else if (app.applicationStatus === 'PENDING_INTERVIEW') {
                interviewCount++;
              }
            });
          }
        } catch (err) {
          console.error(`Erreur lors du chargement des candidatures pour l'offre ${offer.id}:`, err);
        }
      }
      
      setPendingApplicationsCount(pendingCount);
      setInterviewApplicationsCount(interviewCount);
    } catch (error) {
      console.error('Erreur lors du comptage des statuts de candidatures:', error);
    }
  }

  const stats = dashboardService.calculateStats(allOffers);

  useEffect(() => {
    loadOffers();
    loadPastOffers();
  }, []);

  // Charger les statistiques de candidatures quand les offres changent
  useEffect(() => {
    if (allOffers.length > 0 && stats.approved > 0) {
      countApplicationStatuses();
    }
  }, [allOffers.length]);

  const mapFormDataToRequest = (formData: CreateOfferFormData): CreateInternshipOfferRequest => {
    return {
      title: formData.jobTitle,
      description: formData.taskDescription,
      program: formData.program,
      requiredSkills: formData.qualifications,
      duration: formData.duration,
      startDate: formData.startDate,
      salary: formData.salary,
      address: formData.address,
    };
  };

  const handleCreateOffer = async (formData: CreateOfferFormData) => {
    setError(null);
    setSuccess(null);

    const requestData = mapFormDataToRequest(formData);

    const validationError = dashboardService.validateOfferData(requestData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const response = await dashboardService.createInternshipOffer(requestData);

      if (response.success) {
        setSuccess(t('dashboard.offerCreatedSuccess'));
        setShowCreateForm(false);
        loadOffers();
      } else {
        setError(response.error || t('dashboard.creationError'));
      }
    } catch (err) {
      console.error('Erreur de connexion lors de la création:', err);
      setError(t('dashboard.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const statsIcons = {
    total: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
    pending: (
      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    approved: (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    rejected: (
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
      </svg>
    )
  };

  return (
    <div className="mx-auto flex min-h-screen w-full min-w-[320px] flex-col bg-slate-100 lg:ps-96">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main id="page-content" className="flex max-w-full flex-auto flex-col pt-20 lg:pt-0 bg-slate-100">
        <div className="mx-auto w-full xl:max-w-7xl bg-slate-100">
          <div className="mx-auto px-4 sm:px-0 pt-6 pb-3 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="flex justify-between items-center">
            <div>
                <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed">{t('dashboard.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              {activeTab === 'history' && (
                <div className="flex items-center gap-2">
                  <label htmlFor="session-history-employer" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    {t("im.session")}:
                  </label>
                  <select
                    id="session-history-employer"
                    name="session"
                    value={selectedHistorySession}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 min-w-[150px]"
                    onChange={(e) => setSelectedHistorySession(e.target.value)}
                  >
                    {availableSessions.map((session) => (
                      <option key={session} value={session} className="text-gray-900 bg-white">
                        {session}
                      </option>
                    ))}
                  </select>
                </div>
              )}
                {selectedOffer == null && activeTab === 'offers' &&
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                    className="group flex items-center justify-between rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:border-indigo-200 active:bg-indigo-700 transition-colors"
                >
                  {showCreateForm ? t('dashboard.cancel') : t('dashboard.createOffer')}
                </button>
              }
            </div>
          </div>
        </div>
          
          <div className="mx-auto px-4 sm:px-0 pt-4 pb-8 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl space-y-8">

        {/* Messages d'erreur et de succès */}
        {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

          {/* Contenu selon l'onglet actif */}
          {activeTab === 'overview' && (
            <>
        {/* Cartes de statistiques */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 md:gap-6">
                <div className="sm:col-span-6 xl:col-span-3">
              <StatisticsCard
                title={t('dashboard.totalOffers')}
                value={stats.total}
                icon={statsIcons.total}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
                </div>
                <div className="sm:col-span-6 xl:col-span-3">
              <StatisticsCard
                title={t('dashboard.pending')}
                value={stats.pending}
                icon={statsIcons.pending}
                bgColor="bg-yellow-100"
                iconColor="text-yellow-600"
              />
                </div>
                <div className="sm:col-span-6 xl:col-span-3">
              <StatisticsCard
                title={t('dashboard.validated')}
                value={stats.approved}
                icon={statsIcons.approved}
                bgColor="bg-green-100"
                iconColor="text-green-600"
              />
                </div>
                <div className="sm:col-span-6 xl:col-span-3">
              <StatisticsCard
                title={t('dashboard.rejected')}
                value={stats.rejected}
                icon={statsIcons.rejected}
                bgColor="bg-red-100"
                iconColor="text-red-600"
              />
            </div>
              </div>

              {/* Navigation rapide */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Navigation rapide</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('offers')}
                    className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="font-semibold text-slate-900">{t('dashboard.createOffer')}</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      {stats.pending} offre{stats.pending > 1 ? 's' : ''} en attente de validation
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveTab('approved-offers')}
                    className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-slate-900">{t('im.approvedOffers')}</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      {stats.approved} offre{stats.approved > 1 ? 's' : ''} validée{stats.approved > 1 ? 's' : ''}
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
                      <span className="font-semibold text-slate-900">{t('im.internshipContractsSection')}</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      {contracts.length} contrat{contracts.length > 1 ? 's' : ''} de stage
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-slate-900">{t('im.history')}</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      Consulter les offres passées
                    </p>
                  </button>
                </div>
              </div>

              {/* Statistiques supplémentaires */}
              {stats.approved > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Candidatures reçues</h2>
                  <div className="divide-y divide-slate-200">
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-slate-700">Total des candidatures</span>
                      <span className="text-lg font-bold text-slate-900">
                        {Array.from(numbersOfApplications.values()).reduce((sum, count) => sum + count, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-slate-700">En attente</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {pendingApplicationsCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-slate-700">En entrevue</span>
                      <span className="text-lg font-bold text-purple-600">
                        {interviewApplicationsCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-slate-700">Réponses des étudiants</span>
                      <span className="text-lg font-bold text-amber-600">
                        {Array.from(unseenApplicationsCount.values()).reduce((sum, count) => sum + (count.studentsWhoRejectedTheOffer || 0) + (count.studentsWhoAcceptedTheOffer || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-slate-700">Offres avec candidatures</span>
                      <span className="text-lg font-bold text-blue-600">
                        {filteredApprovedOffers.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'offers' && (
            <>
            {/* Formulaire de création d'offre */}
            {showCreateForm && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
              <CreateOfferForm
                onSubmit={handleCreateOffer}
                onCancel={() => setShowCreateForm(false)}
                loading={loading}
              />
                </div>
              )}

              {/* Liste des offres existantes (PENDING) */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="px-6 pt-6 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{t('im.internshipOffersSection')}</h2>
                      <p className="text-sm font-medium text-slate-500 mt-1">{t('im.internshipOffersSubtitle')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative" ref={sortOffersMenuRef}>
                        <SortButton onClick={() => {
                          setShowSortMenuOffers(!showSortMenuOffers);
                          setShowFilterMenuOffers(false);
                        }} />
                        {showSortMenuOffers &&
                          <SortMenuOffers
                            userRole="EMPLOYER"
                            applySorting={(sortBy: string) => {
                              setShowSortMenuOffers(false);
                              setOfferSortBy(sortBy);
                            }}/>
                        }
                      </div>
                      <div className="relative" ref={filterOffersMenuRef}>
                        <FilterButton onClick={() => {
                          setShowSortMenuOffers(false);
                          setShowFilterMenuOffers(!showFilterMenuOffers);
                        }}/>
                        {showFilterMenuOffers &&
                          <FilterMenuOffers
                            userRole="EMPLOYER"
                            applyFilters={(filterBy: string[]) => {
                              setShowFilterMenuOffers(false);
                              setOfferFilters(filterBy);
                            }}/>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 overflow-hidden">
                  <OfferList 
                    changeCursorIfApproved={false}
                    selectOffer={selectOffer}
                    isStudent={false}
                    isEmployer={true}
                    loading={loading}
                    offers={filteredOffers}
                    numbersOfApplications={numbersOfApplications}
                    unseenApplicationsCount={unseenApplicationsCount}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'approved-offers' && (
            <>
              {selectedOffer ? (
                <InternshipApplications 
                  setSelectedOffer={setSelectedOffer}
                  internship={selectedOffer} 
                  countNumberOfUnseenApplications={countNumberOfUnseenApplications} 
                  offers={allOffers}
                  isInternshipManager={false}
                />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white">
                  <div className="px-6 pt-6 relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{t('im.approvedOffers')}</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">{t('im.approvedOffersSubtitle')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative" ref={sortOffersMenuRef}>
                          <SortButton onClick={() => {
                            setShowSortMenuOffers(!showSortMenuOffers);
                            setShowFilterMenuOffers(false);
                          }} />
                          {showSortMenuOffers &&
                            <SortMenuOffers
                              userRole="EMPLOYER"
                              applySorting={(sortBy: string) => {
                                setShowSortMenuOffers(false);
                                setOfferSortBy(sortBy);
                              }}/>
                          }
                        </div>
                        <div className="relative" ref={filterOffersMenuRef}>
                          <FilterButton onClick={() => {
                            setShowSortMenuOffers(false);
                            setShowFilterMenuOffers(!showFilterMenuOffers);
                          }}/>
                          {showFilterMenuOffers &&
                            <FilterMenuOffers
                              userRole="EMPLOYER"
                              applyFilters={(filterBy: string[]) => {
                                setShowFilterMenuOffers(false);
                                setOfferFilters(filterBy);
                              }}/>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 overflow-hidden">
                    {filteredApprovedOffers.length === 0 ? (
                      <p className="text-sm font-medium text-slate-500 text-center py-8">
                        {t('im.noApprovedOffers')}
                      </p>
                    ) : (
                      <OfferList 
                        changeCursorIfApproved={true}
                        selectOffer={selectOffer}
                        isStudent={false}
                        isEmployer={true}
                        loading={loading}
                        offers={filteredApprovedOffers}
                        numbersOfApplications={numbersOfApplications}
                        unseenApplicationsCount={unseenApplicationsCount}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'contracts' && (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="px-6 pt-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                <h2 className="text-xl font-bold text-slate-900">{t('im.internshipContractsSection')}</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{t("im.contractsCount", { count: filteredAndSortedContracts.length })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={sortContractsMenuRef}>
                      <SortButton onClick={() => {
                        setShowSortMenuContracts(!showSortMenuContracts);
                        setShowFilterMenuContracts(false);
                        setShowSortMenuOffers(false);
                        setShowFilterMenuOffers(false);
                      }} />
                      {showSortMenuContracts &&
                        <SortMenuContracts
                          applySorting={(sortBy: string) => {
                            setShowSortMenuContracts(false);
                            setContractSortBy(sortBy);
                          }}/>
                      }
                    </div>
                    <div className="relative" ref={filterContractsMenuRef}>
                      <FilterButton onClick={() => {
                        setShowSortMenuContracts(false);
                        setShowFilterMenuContracts(!showFilterMenuContracts);
                        setShowSortMenuOffers(false);
                        setShowFilterMenuOffers(false);
                      }}/>
                      {showFilterMenuContracts &&
                        <FilterMenuContracts
                          applyFilters={(filterBy: string[]) => {
                            setShowFilterMenuContracts(false);
                            setContractFilters(filterBy);
                          }}/>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 overflow-hidden">
                <InternshipContractList
                  contracts={filteredAndSortedContracts}
                  loading={loadingContracts}
                  onContractUpdate={loadContracts}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && !selectedOffer && (
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="px-6 pt-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {t("im.history")}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{t("im.historySubtitle")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={sortOffersMenuRef}>
                      <SortButton onClick={() => {
                        setShowSortMenuOffers(!showSortMenuOffers);
                        setShowFilterMenuOffers(false);
                      }} />
                      {showSortMenuOffers &&
                        <SortMenuOffers
                          userRole="EMPLOYER"
                          applySorting={(sortBy: string) => {
                            setShowSortMenuOffers(false);
                            setOfferSortBy(sortBy);
                          }}/>
                      }
                    </div>
                    <div className="relative" ref={filterOffersMenuRef}>
                      <FilterButton onClick={() => {
                        setShowSortMenuOffers(false);
                        setShowFilterMenuOffers(!showFilterMenuOffers);
                      }}/>
                      {showFilterMenuOffers &&
                        <FilterMenuOffers
                          userRole="EMPLOYER"
                          isHistory={true}
                          applyFilters={(filterBy: string[]) => {
                            setShowFilterMenuOffers(false);
                            // Pour l'historique, on envoie seulement [program, title] (pas de status, pas de session)
                            const program = filterBy[0];
                            const title = filterBy[1];
                            setOfferFilters([program, title]);
                          }}/>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 overflow-hidden">
                {availableSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg font-medium text-slate-600">
                      {t('im.internshipOffersSectionEmpty')}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      Aucune offre de stage des sessions passées trouvée.
                    </p>
                  </div>
                ) : (
                  <OfferList
                    selectOffer={selectOffer}
                    isStudent={false}
                    isEmployer={true}
                    isHistory={true}
                    loading={loading}
                    offers={filteredHistoryOffers}
                    numbersOfApplications={numbersOfApplications}
                    selectedSession={selectedHistorySession}
                    onSessionChange={setSelectedHistorySession}
                    availableSessions={availableSessions}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && selectedOffer && (
            <InternshipApplications
              isInternshipManager={false}
              setSelectedOffer={setSelectedOffer}
              internship={selectedOffer}
              countNumberOfUnseenApplications={countNumberOfUnseenApplications}
              offers={allOffers}
              onContractCreated={loadContracts}
              isHistory={true}
            />
          )}
          </div>
      </div>
    </main>
    </div>
  );
}
