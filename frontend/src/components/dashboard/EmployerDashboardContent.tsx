import {useEffect, useState, useRef} from 'react';
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
import type {CreateInternshipOfferRequest, CreateOfferFormData, InternshipOffer, UnseenApplicationsCount, InternshipContract} from '../../interfaces';
import InternshipApplications from './InternshipApplications';
import {employerAPI} from "~/services/EmployerAPI";
import {useClickOutside} from "~/hooks/useClickOutside";
import {filterInternshipOffers, sortInternshipOffers} from "~/utils/filterUtils";
import InternshipContractList from './InternshipContractList';
import {useCallback} from 'react';

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
  const [offerFilters, setOfferFilters] = useState<string[]>([]);
  const [offerSortBy, setOfferSortBy] = useState<string>('');
  const [contracts, setContracts] = useState<InternshipContract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Refs pour les dropdowns
  const sortOffersMenuRef = useRef<HTMLDivElement>(null);
  const filterOffersMenuRef = useRef<HTMLDivElement>(null);

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
    }
  }, [navigate]);

  // Réinitialiser selectedOffer quand on change d'onglet (sauf si on reste sur approved-offers)
  useEffect(() => {
    if (activeTab !== 'approved-offers') {
      setSelectedOffer(null);
    }
  }, [activeTab]);

  // Scroller vers le haut quand une offre est sélectionnée pour voir les candidatures
  useEffect(() => {
    if (selectedOffer && activeTab === 'approved-offers') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedOffer, activeTab]);

  // Charger les contrats de l'employeur
  const loadContracts = useCallback(async () => {
    try {
      setLoadingContracts(true);
      const contractsList: InternshipContract[] = [];
      
      // Pour chaque offre validée (APPROVED), charger les candidatures et récupérer les contrats
      const approvedOffers = allOffers.filter(offer => offer.verificationStatus === 'APPROVED' && offer.id);
      
      if (approvedOffers.length > 0) {
        // Charger les contrats en parallèle pour améliorer les performances
        const contractPromises: Promise<{ contract: InternshipContract | null, offerId: number, studentId: number } | null>[] = [];
        
        for (const offer of approvedOffers) {
          if (!offer.id) continue;
          
          try {
            // Récupérer les candidatures pour cette offre
            const applicationsResponse = await employerAPI.getStudentApplicationsBy(offer.id, null, null, null, null);
            if (applicationsResponse.success && applicationsResponse.data) {
              // Pour chaque candidature avec statut ACCEPTED_BY_STUDENT ou PENDING_CONTRACT, charger le contrat
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
                      .catch(err => {
                        console.log(`Contract not found for offer ${offerId}, student ${studentId}:`, err);
                        return null;
                      })
                  );
                }
              }
            }
          } catch (err) {
            console.log(`Error loading applications for offer ${offer.id}:`, err);
          }
        }
        
        const contractResults = await Promise.all(contractPromises);
        
        contractResults.forEach(result => {
          if (result && result.contract) {
            contractsList.push(result.contract);
          }
        });
      }
      
      console.log(`📋 Loaded ${contractsList.length} contracts for employer`);
      setContracts(contractsList);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  }, [allOffers]);

  // Recharger les contrats quand on change vers l'onglet "contracts" ou quand allOffers change
  useEffect(() => {
    if (allOffers.length > 0 && activeTab === 'contracts') {
      loadContracts();
    }
  }, [activeTab, allOffers.length, loadContracts]);

  const selectOffer = (offer: InternshipOffer) => {
    if (offer && offer.verificationStatus === "APPROVED") {
      setSelectedOffer(offer);
      // Changer vers le tab approved-offers si on n'y est pas déjà
      if (activeTab !== 'approved-offers') {
        setActiveTab('approved-offers');
      }
    }
  };

  // Charger les offres existantes
  const loadOffers = async () => {
    try {
      setLoading(true);
      console.log('Chargement des offres...');
      const response = await dashboardService.getInternshipOffers();
      console.log('Réponse du serveur:', response);

      if (response.success && response.data) {
        console.log('Offres chargées:', response.data);
        setAllOffers(response.data);
        await countNumberOfApplicationsForOffers(response.data);
        await countNumberOfUnseenApplications(response.data);
      } else {
        console.error('Erreur lors du chargement:', response.error);
        setError(response.error || t('dashboard.loadingError'));
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(t('dashboard.serverError'));
    } finally {
      setLoading(false);
    }
  };

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

  // Calculer les statistiques
  const stats = dashboardService.calculateStats(allOffers);

  useEffect(() => {
    loadOffers();
  }, []);

  // Fonction pour mapper CreateOfferFormData vers CreateInternshipOfferRequest
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

    // Mapper les données du formulaire vers le format API
    const requestData = mapFormDataToRequest(formData);

    // Validation des données
    const validationError = dashboardService.validateOfferData(requestData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      console.log('Création de l\'offre avec les données:', requestData);
      const response = await dashboardService.createInternshipOffer(requestData);
      console.log('Réponse de création:', response);

      if (response.success) {
        setSuccess(t('dashboard.offerCreatedSuccess'));
        setShowCreateForm(false);
        console.log('Rechargement des offres...');
        loadOffers(); // Recharger la liste
      } else {
        console.error('Erreur lors de la création:', response.error);
        setError(response.error || t('dashboard.creationError'));
      }
    } catch (err) {
      console.error('Erreur de connexion lors de la création:', err);
      setError(t('dashboard.serverError'));
    } finally {
      setLoading(false);
    }
  };

  // Icônes pour les statistiques
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
          {/* En-tête du dashboard - en dehors du conteneur blanc */}
          <div className="mx-auto px-4 sm:px-0 pt-6 pb-3 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
          <div className="flex justify-between items-center">
            <div>
                <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed">{t('dashboard.subtitle')}</p>
            </div>
            <div>
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
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="px-6 pt-6">
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
                <div className="p-6">
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
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="px-6 pt-6">
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
                  <div className="p-6">
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
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="px-6 pt-6">
                <h2 className="text-xl font-bold text-slate-900">{t('im.internshipContractsSection')}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{t("im.contractsCount", { count: contracts.length })}</p>
              </div>
              <div className="p-6">
                <InternshipContractList
                  contracts={contracts}
                  loading={loadingContracts}
                  onContractUpdate={loadContracts}
                />
              </div>
            </div>
          )}
          </div>
      </div>
    </main>
    </div>
  );
}
