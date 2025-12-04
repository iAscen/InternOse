import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { userAPI } from "~/services/UserAPI";
import { dashboardService } from "~/services/dashboardService";
import type {InternshipOffer, Professor} from "~/interfaces";
import type { Cv } from "~/interfaces"
import StatisticsCard from "~/components/dashboard/StatisticsCard";
import DashboardLayout from "~/components/dashboard/DashboardLayout";
import DashboardHeader from "~/components/dashboard/DashboardHeader";
import DashboardSection from "~/components/dashboard/DashboardSection";
import SessionSelector from "~/components/dashboard/SessionSelector";
import SortMenuOffers from "~/components/dashboard/SortMenuOffers";
import FilterMenuOffers from "~/components/dashboard/FilterMenuOffers";
import OfferList from "~/components/dashboard/OfferList";
import CvList from "./CvList";
import SortMenuCvs from "./SortMenuCvs";
import FilterMenuCvs from "./FilterMenuCvs";
import SortMenuContracts from "./SortMenuContracts";
import FilterMenuContracts from "./FilterMenuContracts";
import { useClickOutside } from "~/hooks/useClickOutside";
import { filterInternshipOffers, sortInternshipOffers, filterCvs, sortCvs, filterContracts, sortContracts } from "~/utils/filterUtils";
import InternshipApplications from "~/components/dashboard/InternshipApplications";
import {employerAPI} from "~/services/EmployerAPI";
import InternshipContractList from "~/components/dashboard/InternshipContractList";
import {internshipManagerAPI} from "~/services/InternshipManagerAPI";
import type { InternshipContract } from "~/interfaces";
import { getAvailableSessions, getCurrentSession } from "~/utils/avaliableSessions";

export default function IMDashboardContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [allOffers, setAllOffers] = useState<InternshipOffer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<InternshipOffer | null>(null);
    const [allCvs, setAllCvs] = useState<Cv[]>([]);
    const [filteredOffers, setFilteredOffers] = useState<InternshipOffer[]>([]);
    const [filteredApprovedOffers, setFilteredApprovedOffers] = useState<InternshipOffer[]>([]);
    const [filteredHistoryOffers, setFilteredHistoryOffers] = useState<InternshipOffer[]>([]);
    const [filteredCvs, setFilteredCvs] = useState<Cv[]>([]);
    const [showSortMenuOffers, setShowSortMenuOffers] = useState(false);
    const [showSortMenuResumes, setShowSortMenuResumes] = useState(false);
    const [showFilterMenuOffers, setShowFilterMenuOffers] = useState(false);
    const [showFilterMenuResumes, setShowFilterMenuResumes] = useState(false);
    const [showSortMenuContracts, setShowSortMenuContracts] = useState(false);
    const [showFilterMenuContracts, setShowFilterMenuContracts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offerFilters, setOfferFilters] = useState<string[]>([]);
    const [cvFilters, setCvFilters] = useState<string[]>([]);
    const [contractFilters, setContractFilters] = useState<string[]>([]);
    const [offerSortBy, setOfferSortBy] = useState<string>('');
    const [cvSortBy, setCvSortBy] = useState<string>('');
    const [contractSortBy, setContractSortBy] = useState<string>('');
    const [cvSortOrder, setCvSortOrder] = useState<string>('asc');
    const [contracts, setContracts] = useState<InternshipContract[]>([]);
    const [selectedHistorySession, setSelectedHistorySession] = useState<string>('');
    const [professors, setProfessors] = useState<Professor[]>([])
    const [contractsUpdateKey, setContractsUpdateKey] = useState(0)

    // Get available sessions from approved offers for history view
    const availableSessions = useMemo(() => {
        return getAvailableSessions(allOffers, true);
    }, [allOffers]);

    // Refs pour les dropdowns
    const sortOffersMenuRef = useRef<HTMLDivElement>(null);
    const filterOffersMenuRef = useRef<HTMLDivElement>(null);
    const sortCvsMenuRef = useRef<HTMLDivElement>(null);
    const filterCvsMenuRef = useRef<HTMLDivElement>(null);
    const sortContractsMenuRef = useRef<HTMLDivElement>(null);
    const filterContractsMenuRef = useRef<HTMLDivElement>(null);

    const countNumberOfUnseenApplications = async (offers: InternshipOffer[]) => {
      // This function is passed to InternshipApplications but the result is not used here
      for (const offer of offers) {
        try {
          await employerAPI.getUnseenApplicationsCount(offer.id);
        } catch (err) {
          console.error(`Failed to fetch unseen count for offer ${offer.id}`, err);
        }
      }
    };

    // Fermer les dropdowns quand on clique à l'extérieur
    useClickOutside(sortOffersMenuRef, () => {
        setShowSortMenuOffers(false);
    });

    useClickOutside(filterOffersMenuRef, () => {
        setShowFilterMenuOffers(false);
    });

    useClickOutside(sortCvsMenuRef, () => {
        setShowSortMenuResumes(false);
    });

    useClickOutside(filterCvsMenuRef, () => {
        setShowFilterMenuResumes(false);
    });

    useClickOutside(sortContractsMenuRef, () => {
        setShowSortMenuContracts(false);
    });

    useClickOutside(filterContractsMenuRef, () => {
        setShowFilterMenuContracts(false);
    });

    // Icônes pour les statistiques
    const statsIcons = {
        pending: (
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        approved: (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        refused: (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )
    };

    // Vérifier l'authentification au chargement
    useEffect(() => {
        if (!userAPI.isAuthenticated()) {
            navigate('/login');
        } else {
            const userRole = userAPI.getUserRole();
            if (userRole !== 'INTERNSHIP_MANAGER') {
                // Rediriger vers le bon dashboard selon le rôle
                switch (userRole) {
                    case 'EMPLOYER':
                        navigate('/employer-dashboard');
                        break;
                    case 'STUDENT':
                        navigate('/student-dashboard');
                        break;
                    default:
                        navigate('/');
                        break;
                }
            }
        }
    }, [navigate]);

    const loadProfessors = async () => {
      try {
        setLoading(true)
        
        const response = await internshipManagerAPI.findAllProfessors()

        if (response.success && response.data) {
          setProfessors(response.data)
        }
        else {
          setError(response.error || t('dashboard.loadingError'));
        }
      } catch(err) {
        setError('dashboard.serverError')
      } finally {
        setLoading(false)
      }
    }

    // Charger toutes les offres de stage (sans filtres backend)
    const loadOffers = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getAllInternshipOffers();
            if (response.success && response.data) {
                setAllOffers(response.data);
            } else {
                setError(response.error || t('dashboard.loadingError'));
            }
        } catch (err) {
            setError(t('dashboard.serverError'));
        } finally {
            setLoading(false);
        }
    };

    const loadCvs = async () => {
        try {
            setLoading(true);
            console.log('Loading CVs...');
            const response = await dashboardService.getAllCvs();
            console.log('CV response:', response);
            if (response.success && response.data) {
                const cvs: Cv[] = response.data
                console.log('CVs loaded:', cvs);
                setAllCvs(cvs);
            } else {
                console.error('CV loading failed:', response.error);
                setError(response.error || t('dashboard.loadingError'));
            }
        } catch (err) {
            console.error('CV loading error:', err);
            setError(t('dashboard.serverError'));
        } finally {
            setLoading(false);
        }
    }

    const loadContracts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await internshipManagerAPI.getAllInternshipContracts();
            if (response.success && response.data) {
                console.log("Contracts loaded")
                // Filtrer par session actuelle (sauf dans l'onglet historique)
                let contracts = response.data;
                if (activeTab !== 'history') {
                    const currentSession = getCurrentSession();
                    contracts = response.data.filter((contract: InternshipContract) => {
                        // Trouver l'offre correspondante pour vérifier la session
                        const offer = allOffers.find(o => o.id === contract.internshipOfferId);
                        return offer && offer.session === currentSession;
                    });
                }
                setContracts(contracts);
                // Incrémenter la clé pour forcer le rechargement dans InternshipApplications
                setContractsUpdateKey(prev => prev + 1);
            } else {
                setError(response.error || t('dashboard.loadingError'));
            }
        } catch (err) {
            setError(t('dashboard.serverError'));
        } finally {
            setLoading(false);
        }
    }, [allOffers, activeTab, t]);

    // Apply filters and sorting to offers (PENDING only)
    useEffect(() => {
        // Filtrer seulement les offres PENDING ou sans statut
        let filtered = allOffers.filter(offer => !offer.verificationStatus || offer.verificationStatus === 'PENDING');
        
        // Filtrer par session actuelle (sauf dans l'onglet historique)
        if (activeTab !== 'history') {
            const currentSession = getCurrentSession();
            filtered = filtered.filter(offer => offer.session === currentSession);
        }
        
        // Apply filters
        const program = offerFilters[0];
        const title = offerFilters[1];
        
        if (program || title) {
            filtered = filterInternshipOffers(filtered, {
                program,
                title
            });
        }
        
        // Apply sorting
        if (offerSortBy) {
            filtered = sortInternshipOffers(filtered, offerSortBy, true);
        }
        
        setFilteredOffers(filtered);
    }, [allOffers, offerFilters, offerSortBy, activeTab]);

    // Apply filters and sorting to approved offers
    useEffect(() => {
        // Filtrer seulement les offres APPROVED
        let filtered = allOffers.filter(offer => offer.verificationStatus === 'APPROVED');
        
        // Filtrer par session actuelle (sauf dans l'onglet historique)
        if (activeTab !== 'history') {
            const currentSession = getCurrentSession();
            filtered = filtered.filter(offer => offer.session === currentSession);
        }
        
        // Apply filters
        const program = offerFilters[0];
        const title = offerFilters[1];
        
        if (program || title) {
            filtered = filterInternshipOffers(filtered, {
                program,
                title
            });
        }
        
        // Apply sorting
        if (offerSortBy) {
            filtered = sortInternshipOffers(filtered, offerSortBy, true);
        }
        
        setFilteredApprovedOffers(filtered);
    }, [allOffers, offerFilters, offerSortBy, activeTab]);

    useEffect(() => {
        let filtered = allOffers;

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
    }, [allOffers, offerFilters, offerSortBy]);

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

    // Apply filters and sorting to CVs
    useEffect(() => {
        let filtered = allCvs;
        
        // Apply filters
        const status = cvFilters[0];
        const institution = cvFilters[2];
        
        if (status || institution) {
            filtered = filterCvs(filtered, { status, institution });
        }
        
        // Apply sorting
        if (cvSortBy) {
            filtered = sortCvs(filtered, cvSortBy, cvSortOrder === 'asc');
        }
        
        setFilteredCvs(filtered);
    }, [allCvs, cvFilters, cvSortBy, cvSortOrder]);

    useEffect(() => {
        loadOffers();
        loadCvs();
        loadProfessors();
    }, []);

    useEffect(() => {
        if (allOffers.length > 0) {
            loadContracts();
        }
    }, [allOffers.length, activeTab, loadContracts]);

    // Réinitialiser selectedOffer quand on change d'onglet (sauf si on reste sur approved-offers)
    useEffect(() => {
        if (activeTab !== 'approved-offers') {
            setSelectedOffer(null);
        }
    }, [activeTab]);

    // Scroller vers le haut quand une offre est sélectionnée pour voir les candidatures
    useEffect(() => {
        if (selectedOffer && (activeTab === 'approved-offers' || activeTab === 'history')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedOffer, activeTab]);

    const selectOffer = (offer: InternshipOffer) => {
      if (offer && offer.verificationStatus === "APPROVED") {
        setSelectedOffer(offer);
        // Only change tab if not already on history or approved-offers
        if (activeTab !== 'history' && activeTab !== 'approved-offers') {
          setActiveTab('approved-offers');
        }
      }
    }



  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} error={error}>
      <DashboardHeader
        subtitle="im.dashboardSubtitle"
        variant={activeTab === 'history' ? 'history' : 'default'}
        rightContent={activeTab === 'history' && (
          <SessionSelector
            id="session-history"
            value={selectedHistorySession}
            availableSessions={availableSessions}
            onChange={setSelectedHistorySession}
          />
        )}
      />

      <div className="mx-auto px-4 sm:px-0 pt-4 pb-8 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl space-y-8">

          {/* Contenu selon l'onglet actif */}
          {activeTab === 'overview' && (
            <>
              {/* Statistiques */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 md:gap-6">
                <div className="sm:col-span-6 xl:col-span-4">
                  <StatisticsCard
                    title={t('im.pendingSubmissions')}
                    value={(() => {
                      const currentSession = getCurrentSession();
                      const pendingOffers = allOffers.filter(offer => 
                        offer.session === currentSession && 
                        (!offer.verificationStatus || offer.verificationStatus === 'PENDING')
                      ).length;
                      const pendingCvs = allCvs.filter(cv => cv.cvStatus === 'pending' || cv.cvStatus === 'PENDING').length;
                      return pendingOffers + pendingCvs;
                    })()}
                    icon={statsIcons.pending}
                    bgColor="bg-yellow-100"
                    iconColor="text-yellow-600"
                  />
                </div>
                <div className="sm:col-span-6 xl:col-span-4">
                  <StatisticsCard
                    title={t('im.approvedSubmissions')}
                    value={(() => {
                      const currentSession = getCurrentSession();
                      return allOffers.filter(offer => 
                        offer.session === currentSession && 
                        offer.verificationStatus === 'APPROVED'
                      ).length;
                    })()}
                    icon={statsIcons.approved}
                    bgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                </div>
                <div className="sm:col-span-6 xl:col-span-4">
                  <StatisticsCard
                    title={t('im.refusedSubmissions')}
                    value={(() => {
                      const currentSession = getCurrentSession();
                      const rejectedOffers = allOffers.filter(offer => 
                        offer.session === currentSession && 
                        offer.verificationStatus === 'REJECTED'
                      ).length;
                      const rejectedCvs = allCvs.filter(cv => cv.cvStatus === 'rejected' || cv.cvStatus === 'REJECTED').length;
                      return rejectedOffers + rejectedCvs;
                    })()}
                    icon={statsIcons.refused}
                    bgColor="bg-red-100"
                    iconColor="text-red-600"
                  />
                </div>
              </div>

              {/* Navigation rapide */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{t('im.quickNavigation')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('offers')}
                    className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-slate-900">{t('im.internshipOffers')}</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      {t('im.offersPending', { 
                        count: (() => {
                          const currentSession = getCurrentSession();
                          return allOffers.filter(offer => 
                            offer.session === currentSession && 
                            (!offer.verificationStatus || offer.verificationStatus === 'PENDING')
                          ).length;
                        })(),
                        plural: (() => {
                          const currentSession = getCurrentSession();
                          return allOffers.filter(offer => 
                            offer.session === currentSession && 
                            (!offer.verificationStatus || offer.verificationStatus === 'PENDING')
                          ).length > 1 ? 's' : '';
                        })()
                      })}
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveTab('cvs')}
                    className="flex flex-col items-start p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-slate-900">{t('im.studentCvsTitle')}</span>
                    </div>
                    <p className="text-sm text-slate-600 text-left">
                      {t('im.cvsPending', { 
                        count: allCvs.filter(cv => cv.cvStatus === 'pending' || cv.cvStatus === 'PENDING').length,
                        plural: allCvs.filter(cv => cv.cvStatus === 'pending' || cv.cvStatus === 'PENDING').length > 1 ? 's' : ''
                      })}
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
                      {t('im.offersValidated', { 
                        count: (() => {
                          const currentSession = getCurrentSession();
                          return allOffers.filter(offer => 
                            offer.session === currentSession && 
                            offer.verificationStatus === 'APPROVED'
                          ).length;
                        })(),
                        plural: (() => {
                          const currentSession = getCurrentSession();
                          return allOffers.filter(offer => 
                            offer.session === currentSession && 
                            offer.verificationStatus === 'APPROVED'
                          ).length > 1 ? 's' : '';
                        })()
                      })}
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
                      {t('im.internshipContracts', { 
                        count: contracts.length,
                        plural: contracts.length > 1 ? 's' : ''
                      })}
                    </p>
                  </button>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('im.internshipOffersTitle')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">{t('im.pendingStatus')}</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {(() => {
                          const currentSession = getCurrentSession();
                          return allOffers.filter(offer => 
                            offer.session === currentSession && 
                            (!offer.verificationStatus || offer.verificationStatus === 'PENDING')
                          ).length;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">{t('im.approvedStatus')}</span>
                      <span className="text-lg font-bold text-green-600">
                        {(() => {
                          const currentSession = getCurrentSession();
                          return allOffers.filter(offer => 
                            offer.session === currentSession && 
                            offer.verificationStatus === 'APPROVED'
                          ).length;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">{t('im.rejectedStatus')}</span>
                      <span className="text-lg font-bold text-red-600">
                        {(() => {
                          const currentSession = getCurrentSession();
                          return allOffers.filter(offer => 
                            offer.session === currentSession && 
                            offer.verificationStatus === 'REJECTED'
                          ).length;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('im.studentCvsTitle')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">{t('im.pendingStatus')}</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {allCvs.filter(cv => cv.cvStatus === 'pending' || cv.cvStatus === 'PENDING').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">{t('im.approvedCvs')}</span>
                      <span className="text-lg font-bold text-green-600">
                        {allCvs.filter(cv => cv.cvStatus === 'approved' || cv.cvStatus === 'APPROVED').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">{t('im.rejectedCvs')}</span>
                      <span className="text-lg font-bold text-red-600">
                        {allCvs.filter(cv => cv.cvStatus === 'rejected' || cv.cvStatus === 'REJECTED').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'offers' && (
            <DashboardSection
              title="im.internshipOffers"
              subtitle="im.internshipOffersSubtitle"
              showSort={true}
              showFilter={true}
              sortMenuRef={sortOffersMenuRef}
              filterMenuRef={filterOffersMenuRef}
              onSortToggle={() => {
                setShowSortMenuOffers(!showSortMenuOffers);
                setShowFilterMenuOffers(false);
                setShowSortMenuResumes(false);
                setShowFilterMenuResumes(false);
              }}
              onFilterToggle={() => {
                setShowSortMenuOffers(false);
                setShowFilterMenuOffers(!showFilterMenuOffers);
                setShowSortMenuResumes(false);
                setShowFilterMenuResumes(false);
              }}
              sortMenu={showSortMenuOffers && (
                <SortMenuOffers
                  userRole="INTERNSHIP_MANAGER"
                  applySorting={(sortBy: string) => {
                    setShowSortMenuOffers(false);
                    setOfferSortBy(sortBy);
                  }}
                />
              )}
              filterMenu={showFilterMenuOffers && (
                <FilterMenuOffers
                  userRole="INTERNSHIP_MANAGER"
                  activeTab={activeTab}
                  applyFilters={(filterBy: string[]) => {
                    setShowFilterMenuOffers(false);
                    setOfferFilters(filterBy);
                  }}
                />
              )}
              loading={loading}
            >
              <OfferList
                selectOffer={selectOffer}
                isStudent={false}
                isEmployer={false}
                loading={loading}
                offers={filteredOffers}
                numbersOfApplications={[]}
                onOfferValidation={() => loadOffers()}
              />
            </DashboardSection>
          )}

          {activeTab === 'approved-offers' && !selectedOffer && (
            <DashboardSection
              title="im.approvedOffers"
              subtitle="im.approvedOffersSubtitle"
              showSort={true}
              showFilter={true}
              sortMenuRef={sortOffersMenuRef}
              filterMenuRef={filterOffersMenuRef}
              onSortToggle={() => {
                setShowSortMenuOffers(!showSortMenuOffers);
                setShowFilterMenuOffers(false);
                setShowSortMenuResumes(false);
                setShowFilterMenuResumes(false);
              }}
              onFilterToggle={() => {
                setShowSortMenuOffers(false);
                setShowFilterMenuOffers(!showFilterMenuOffers);
                setShowSortMenuResumes(false);
                setShowFilterMenuResumes(false);
              }}
              sortMenu={showSortMenuOffers && (
                <SortMenuOffers
                  userRole="INTERNSHIP_MANAGER"
                  applySorting={(sortBy: string) => {
                    setShowSortMenuOffers(false);
                    setOfferSortBy(sortBy);
                  }}
                />
              )}
              filterMenu={showFilterMenuOffers && (
                <FilterMenuOffers
                  userRole="INTERNSHIP_MANAGER"
                  activeTab={activeTab}
                  applyFilters={(filterBy: string[]) => {
                    setShowFilterMenuOffers(false);
                    setOfferFilters(filterBy);
                  }}
                />
              )}
              loading={loading}
              emptyMessage={filteredApprovedOffers.length === 0 ? "im.noApprovedOffers" : undefined}
            >
              {filteredApprovedOffers.length > 0 && (
                <OfferList
                  selectOffer={selectOffer}
                  isStudent={false}
                  isEmployer={false}
                  loading={loading}
                  offers={filteredApprovedOffers}
                  numbersOfApplications={[]}
                  onOfferValidation={() => loadOffers()}
                />
              )}
            </DashboardSection>
          )}

          {activeTab === 'approved-offers' && selectedOffer && (
            <InternshipApplications
              isInternshipManager={true}
              setSelectedOffer={setSelectedOffer}
              internship={selectedOffer} 
              countNumberOfUnseenApplications={countNumberOfUnseenApplications} 
              offers={allOffers}
              onContractCreated={loadContracts}
              isHistory={false}
              contractsUpdateKey={contractsUpdateKey}
              allContracts={contracts}
            />
          )}

          {activeTab === 'cvs' && (
            <DashboardSection
              title="im.resumesSection"
              subtitle="im.resumesSectionSubtitle"
              showSort={true}
              showFilter={true}
              sortMenuRef={sortCvsMenuRef}
              filterMenuRef={filterCvsMenuRef}
              onSortToggle={() => {
                setShowSortMenuOffers(false);
                setShowFilterMenuOffers(false);
                setShowSortMenuResumes(!showSortMenuResumes);
                setShowFilterMenuResumes(false);
              }}
              onFilterToggle={() => {
                setShowSortMenuOffers(false);
                setShowFilterMenuOffers(false);
                setShowSortMenuResumes(false);
                setShowFilterMenuResumes(!showFilterMenuResumes);
              }}
              sortMenu={showSortMenuResumes && (
                <SortMenuCvs
                  applySorting={(sortBy: string, sortOrder: string) => {
                    setShowSortMenuResumes(false);
                    setCvSortBy(sortBy);
                    setCvSortOrder(sortOrder);
                  }}
                />
              )}
              filterMenu={showFilterMenuResumes && (
                <FilterMenuCvs
                  applyFilters={(filterBy: string[]) => {
                    setShowFilterMenuResumes(false);
                    setCvFilters(filterBy);
                  }}
                />
              )}
              loading={loading}
              emptyMessage={filteredCvs.length === 0 ? "im.resumesSectionEmpty" : undefined}
            >
              {filteredCvs.length > 0 && (
                <CvList
                  loading={loading}
                  cvs={filteredCvs}
                  onCvValidation={() => loadCvs()}
                />
              )}
            </DashboardSection>
          )}

          {activeTab === 'contracts' && (
            <DashboardSection
              title="im.internshipContractsSection"
              subtitle={t('im.contractsCount', { count: contracts.length })}
              showSort={true}
              showFilter={true}
              sortMenuRef={sortContractsMenuRef}
              filterMenuRef={filterContractsMenuRef}
              onSortToggle={() => {
                setShowSortMenuContracts(!showSortMenuContracts);
                setShowFilterMenuContracts(false);
                setShowSortMenuOffers(false);
                setShowFilterMenuOffers(false);
                setShowSortMenuResumes(false);
                setShowFilterMenuResumes(false);
              }}
              onFilterToggle={() => {
                setShowSortMenuContracts(false);
                setShowFilterMenuContracts(!showFilterMenuContracts);
                setShowSortMenuOffers(false);
                setShowFilterMenuOffers(false);
                setShowSortMenuResumes(false);
                setShowFilterMenuResumes(false);
              }}
              sortMenu={showSortMenuContracts && (
                <SortMenuContracts
                  applySorting={(sortBy: string) => {
                    setShowSortMenuContracts(false);
                    setContractSortBy(sortBy);
                  }}
                />
              )}
              filterMenu={showFilterMenuContracts && (
                <FilterMenuContracts
                  applyFilters={(filterBy: string[]) => {
                    setShowFilterMenuContracts(false);
                    setContractFilters(filterBy);
                  }}
                />
              )}
              loading={loading}
            >
              <InternshipContractList
                contracts={filteredAndSortedContracts}
                loading={loading}
                onContractUpdate={loadContracts}
                professors={professors}
              />
            </DashboardSection>
          )}

            {activeTab === 'history' && !selectedOffer && (
              <DashboardSection
                title="im.history"
                subtitle="im.historySubtitle"
                showSort={true}
                showFilter={true}
                sortMenuRef={sortOffersMenuRef}
                filterMenuRef={filterOffersMenuRef}
                onSortToggle={() => {
                  setShowSortMenuOffers(!showSortMenuOffers);
                  setShowFilterMenuOffers(false);
                  setShowSortMenuResumes(false);
                  setShowFilterMenuResumes(false);
                }}
                onFilterToggle={() => {
                  setShowSortMenuOffers(false);
                  setShowFilterMenuOffers(!showFilterMenuOffers);
                  setShowSortMenuResumes(false);
                  setShowFilterMenuResumes(false);
                }}
                sortMenu={showSortMenuOffers && (
                  <SortMenuOffers
                    userRole="INTERNSHIP_MANAGER"
                    applySorting={(sortBy: string) => {
                      setShowSortMenuOffers(false);
                      setOfferSortBy(sortBy);
                    }}
                  />
                )}
                filterMenu={showFilterMenuOffers && (
                  <FilterMenuOffers
                    userRole="INTERNSHIP_MANAGER"
                    activeTab={activeTab}
                    applyFilters={(filterBy: string[]) => {
                      setShowFilterMenuOffers(false);
                      setOfferFilters(filterBy);
                    }}
                  />
                )}
                loading={loading}
              >
                <OfferList
                  selectOffer={selectOffer}
                  isStudent={false}
                  isEmployer={false}
                  isHistory={true}
                  loading={loading}
                  offers={filteredHistoryOffers}
                  numbersOfApplications={[]}
                  onOfferValidation={() => loadOffers()}
                  selectedSession={selectedHistorySession}
                  onSessionChange={setSelectedHistorySession}
                  availableSessions={availableSessions}
                />
              </DashboardSection>
            )}

            {activeTab === 'history' && selectedOffer && (
              <InternshipApplications
                isInternshipManager={true}
                setSelectedOffer={setSelectedOffer}
                internship={selectedOffer}
                countNumberOfUnseenApplications={countNumberOfUnseenApplications}
                offers={allOffers}
                onContractCreated={loadContracts}
                isHistory={true}
                contractsUpdateKey={contractsUpdateKey}
                allContracts={contracts}
              />
            )}
      </div>
    </DashboardLayout>
  )
}


