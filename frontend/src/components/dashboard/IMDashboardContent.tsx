import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { userAPI } from "~/services/UserAPI";
import { dashboardService } from "~/services/dashboardService";
import type {InternshipOffer, UnseenApplicationsCount} from "~/interfaces";
import type { Cv } from "~/interfaces"
import StatisticsCard from "~/components/dashboard/StatisticsCard";
import SortButton from "~/components/dashboard/SortButton";
import SortMenuOffers from "~/components/dashboard/SortMenuOffers";
import FilterButton from "~/components/dashboard/FilterButton";
import FilterMenuOffers from "~/components/dashboard/FilterMenuOffers";
import OfferList from "~/components/dashboard/OfferList";
import CvList from "./CvList";
import SortMenuCvs from "./SortMenuCvs";
import FilterMenuCvs from "./FilterMenuCvs";
import DashboardSidebar from "./DashboardSidebar";
import { useClickOutside } from "~/hooks/useClickOutside";
import { filterInternshipOffers, sortInternshipOffers, filterCvs, sortCvs } from "~/utils/filterUtils";
import InternshipApplications from "~/components/dashboard/InternshipApplications";
import {employerAPI} from "~/services/EmployerAPI";
import InternshipContractList from "~/components/dashboard/InternshipContractList";
import {internshipManagerAPI} from "~/services/InternshipManagerAPI";
import type { InternshipContract } from "~/interfaces";
import { getAvailableSessions } from "~/utils/avaliableSessions";

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
    const [error, setError] = useState<string | null>(null);
    const [offerFilters, setOfferFilters] = useState<string[]>([]);
    const [cvFilters, setCvFilters] = useState<string[]>([]);
    const [offerSortBy, setOfferSortBy] = useState<string>('');
    const [cvSortBy, setCvSortBy] = useState<string>('');
    const [cvSortOrder, setCvSortOrder] = useState<string>('asc');
    const [contracts, setContracts] = useState<InternshipContract[]>([]);
    const [selectedHistorySession, setSelectedHistorySession] = useState<string>('');

    // Get available sessions from approved offers for history view
    const availableSessions = useMemo(() => {
        return getAvailableSessions(allOffers, true);
    }, [allOffers]);

    // Refs pour les dropdowns
    const sortOffersMenuRef = useRef<HTMLDivElement>(null);
    const filterOffersMenuRef = useRef<HTMLDivElement>(null);
    const sortCvsMenuRef = useRef<HTMLDivElement>(null);
    const filterCvsMenuRef = useRef<HTMLDivElement>(null);

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

    const loadContracts = async () => {
        try {
            setLoading(true);
            const response = await internshipManagerAPI.getAllInternshipContracts();
            if (response.success && response.data) {
                console.log("Contracts loaded")
                setContracts(response.data);
            } else {
                setError(response.error || t('dashboard.loadingError'));
            }
        } catch (err) {
            setError(t('dashboard.serverError'));
        } finally {
            setLoading(false);
        }
    }

    // Apply filters and sorting to offers (PENDING only)
    useEffect(() => {
        // Filtrer seulement les offres PENDING ou sans statut
        let filtered = allOffers.filter(offer => !offer.verificationStatus || offer.verificationStatus === 'PENDING');
        
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
    }, [allOffers, offerFilters, offerSortBy]);

    // Apply filters and sorting to approved offers
    useEffect(() => {
        // Filtrer seulement les offres APPROVED
        let filtered = allOffers.filter(offer => offer.verificationStatus === 'APPROVED');
        
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
    }, [allOffers, offerFilters, offerSortBy]);

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
        loadContracts();
    }, []);

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
    <div className="mx-auto flex min-h-screen w-full min-w-[320px] flex-col bg-slate-100 lg:ps-96">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main id="page-content" className="flex max-w-full flex-auto flex-col pt-20 lg:pt-0 bg-slate-100">
        <div className="mx-auto w-full xl:max-w-7xl bg-slate-100">
          {/* Titre et sous-titre - en dehors du conteneur blanc */}
          <div className="mx-auto px-4 sm:px-0 pt-6 pb-3 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
            <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed">
              {t("im.dashboardSubtitle")}
            </p>
          </div>
          
          <div className="mx-auto px-4 sm:px-0 pt-4 pb-8 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl space-y-8">

          {/* Messages d'erreur */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Contenu selon l'onglet actif */}
          {activeTab === 'overview' && (
            <>
              {/* Statistiques */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 md:gap-6">
                <div className="sm:col-span-6 xl:col-span-4">
                  <StatisticsCard
                    title={t('im.pendingSubmissions')}
                    value={(() => {
                      const pendingOffers = allOffers.filter(offer => !offer.verificationStatus || offer.verificationStatus === 'PENDING').length;
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
                    value={
                      allOffers.filter(offer => offer.verificationStatus === 'APPROVED').length +
                      allCvs.filter(cv => cv.cvStatus === 'approved' || cv.cvStatus === 'APPROVED').length
                    }
                    icon={statsIcons.approved}
                    bgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                </div>
                <div className="sm:col-span-6 xl:col-span-4">
                  <StatisticsCard
                    title={t('im.refusedSubmissions')}
                    value={
                      allOffers.filter(offer => offer.verificationStatus === 'REJECTED').length +
                      allCvs.filter(cv => cv.cvStatus === 'rejected' || cv.cvStatus === 'REJECTED').length
                    }
                    icon={statsIcons.refused}
                    bgColor="bg-red-100"
                    iconColor="text-red-600"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'offers' && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="px-6 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {t("im.internshipOffers")}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{t("im.internshipOffersSubtitle")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={sortOffersMenuRef}>
                      <SortButton onClick={() => {
                        setShowSortMenuOffers(!showSortMenuOffers)
                        setShowFilterMenuOffers(false)
                        setShowSortMenuResumes(false)
                        setShowFilterMenuResumes(false)
                      }} />
                      {showSortMenuOffers &&
                          <SortMenuOffers
                              userRole="INTERNSHIP_MANAGER"
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
                        setShowSortMenuResumes(false)
                        setShowFilterMenuResumes(false)
                      }}/>
                      {showFilterMenuOffers &&
                          <FilterMenuOffers
                              userRole="INTERNSHIP_MANAGER"
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
                  selectOffer={selectOffer}
                  isStudent={false}
                  isEmployer={false}
                  loading={loading}
                  offers={filteredOffers}
                  numbersOfApplications={[]}
                  onOfferValidation={() => loadOffers()}
                />
              </div>
            </div>
          )}

          {activeTab === 'approved-offers' && !selectedOffer && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="px-6 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {t("im.approvedOffers")}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{t("im.approvedOffersSubtitle")}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredApprovedOffers.length === 0 ? (
                  <p className="text-sm font-medium text-slate-500 text-center py-8">
                    {t("im.noApprovedOffers")}
                  </p>
                ) : (
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
              </div>
            </div>
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
            />
          )}

          {activeTab === 'cvs' && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="px-6 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {t("im.resumesSection")}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{t("im.resumesSectionSubtitle")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={sortCvsMenuRef}>
                      <SortButton onClick={() => {
                        setShowSortMenuOffers(false)
                        setShowFilterMenuOffers(false)
                        setShowSortMenuResumes(!showSortMenuResumes)
                        setShowFilterMenuResumes(false)
                      }} />
                      {showSortMenuResumes &&
                          <SortMenuCvs applySorting={(sortBy: string, sortOrder: string) => {
                            setShowSortMenuResumes(false);
                            setCvSortBy(sortBy);
                            setCvSortOrder(sortOrder);
                          }}/>
                      }
                    </div>
                    <div className="relative" ref={filterCvsMenuRef}>
                      <FilterButton onClick={() => {
                        setShowSortMenuOffers(false)
                        setShowFilterMenuOffers(false)
                        setShowSortMenuResumes(false)
                        setShowFilterMenuResumes(!showFilterMenuResumes)
                      }}/>
                      {showFilterMenuResumes &&
                          <FilterMenuCvs applyFilters={(filterBy: string[]) => {
                            setShowFilterMenuResumes(false);
                            setCvFilters(filterBy);
                          }}/>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredCvs.length != 0 && <CvList
                    loading={loading}
                    cvs={filteredCvs}
                    onCvValidation={() => loadCvs()}
                ></CvList>}
                {filteredCvs.length == 0 &&
                    <div className="text-center text-slate-600 text-sm font-medium">
                      {t('im.resumesSectionEmpty')}
                    </div>
                }
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="px-6 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {t("im.internshipContractsSection")}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{t("im.contractsCount", { count: contracts.length })}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <InternshipContractList
                  contracts={contracts}
                  loading={loading}
                  onContractUpdate={loadContracts}
                />
              </div>
            </div>
          )}

            {activeTab === 'history' && !selectedOffer && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="px-6 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {t("im.history")}
                      </h2>
                      <p className="text-sm font-medium text-slate-500 mt-1">{t("im.historySubtitle")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative" ref={filterOffersMenuRef}>
                        <div className="mb-3">
                          <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1 flex justify-center">
                            {t("im.session")}
                          </label>

                          <select
                            id="session"
                            name="session"
                            value={selectedHistorySession}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            onChange={(e) => setSelectedHistorySession(e.target.value)}
                          >
                            {availableSessions.map((session) => (
                              <option key={session} value={session} className="text-gray-900 bg-white">
                                {session}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <div className="relative" ref={sortOffersMenuRef}>
                      <SortButton onClick={() => {
                        setShowSortMenuOffers(!showSortMenuOffers)
                        setShowFilterMenuOffers(false)
                        setShowSortMenuResumes(false)
                        setShowFilterMenuResumes(false)
                      }} />
                      {showSortMenuOffers &&
                          <SortMenuOffers
                              userRole="INTERNSHIP_MANAGER"
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
                        setShowSortMenuResumes(false)
                        setShowFilterMenuResumes(false)
                      }}/>
                      {showFilterMenuOffers &&
                          <FilterMenuOffers
                              userRole="INTERNSHIP_MANAGER"
                              applyFilters={(filterBy: string[]) => {
                                setShowFilterMenuOffers(false);
                                setOfferFilters(filterBy);
                              }}/>
                      }
                    </div>
                  </div>
                </div>
                <div className="p-6">
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
                </div>
              </div>
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
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


