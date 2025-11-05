import { useEffect, useState, useRef } from "react";
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
import { useClickOutside } from "~/hooks/useClickOutside";
import { filterInternshipOffers, sortInternshipOffers, filterCvs, sortCvs } from "~/utils/filterUtils";
import InternshipApplications from "~/components/dashboard/InternshipApplications";
import {employerAPI} from "~/services/EmployerAPI";

export default function IMDashboardContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [allOffers, setAllOffers] = useState<InternshipOffer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<InternshipOffer | null>(null)
    const [allCvs, setAllCvs] = useState<Cv[]>([]);
    const [filteredOffers, setFilteredOffers] = useState<InternshipOffer[]>([]);
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
    const [unseenApplicationsCount, setUnseenApplicationsCount] = useState<Map<number, UnseenApplicationsCount>>(new Map());


    // Refs pour les dropdowns
    const sortOffersMenuRef = useRef<HTMLDivElement>(null);
    const filterOffersMenuRef = useRef<HTMLDivElement>(null);
    const sortCvsMenuRef = useRef<HTMLDivElement>(null);
    const filterCvsMenuRef = useRef<HTMLDivElement>(null);

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

    // Apply filters and sorting to offers
    useEffect(() => {
        let filtered = allOffers;
        
        // Apply filters
        const status = offerFilters[0];
        const program = offerFilters[1];
        const title = offerFilters[2];
        
        if (status || program || title) {
            filtered = filterInternshipOffers(filtered, {
                status,
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
    }, []);

    const selectOffer = (offer: InternshipOffer) => {
      if (offer && offer.verificationStatus === "APPROVED")
        setSelectedOffer(offer)
    }



  return (
        <div>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Titre et sous-titre */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {t('im.dashboard')}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {t("im.dashboardSubtitle")}
                        </p>
                    </div>

                    {/* Messages d'erreur */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    {selectedOffer == null && (
                      <>
                        {/* Statistiques */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <StatisticsCard
                            title={t('im.pendingSubmissions')}
                            value={(() => {
                              const pendingOffers = allOffers.filter(offer => !offer.verificationStatus || offer.verificationStatus === 'PENDING').length;
                              const pendingCvs = allCvs.filter(cv => cv.cvStatus === 'pending' || cv.cvStatus === 'PENDING').length;
                              console.log('Pending offers:', pendingOffers, 'Pending CVs:', pendingCvs, 'Total:', pendingOffers + pendingCvs);
                              return pendingOffers + pendingCvs;
                            })()}
                            icon={statsIcons.pending}
                            bgColor="bg-yellow-100"
                            iconColor="text-yellow-600"
                          />
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

                        {/* Section "Offres de stages des employeurs" */}
                        <div className="bg-white rounded-lg shadow-md mb-8 p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                              {t("im.internshipOffersSection")}
                            </h2>
                            <div className="flex items-center space-x-4">
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
                          <OfferList
                            selectOffer={selectOffer}
                            isStudent={false}
                            isEmployer={false}
                            loading={loading}
                            offers={filteredOffers}
                            onOfferValidation={() => loadOffers()}
                          />
                        </div>

                        {/* Section "Candidatures (CVs) des étudiants" */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                              {t("im.resumesSection")}
                            </h2>
                            <div className="flex items-center space-x-4 text-gray-900">
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
                          {filteredCvs.length != 0 && <CvList
                              loading={loading}
                              cvs={filteredCvs}
                              onCvValidation={() => loadCvs()}
                          ></CvList>}
                          {filteredCvs.length == 0 &&
                              <div className="text-center text-gray-900">
                                {t('im.resumesSectionEmpty')}
                              </div>
                          }
                        </div>
                      </>
                    )

                    } {
                  selectedOffer &&
                    <InternshipApplications
                        isInternshipManager={true}
                        setSelectedOffer={setSelectedOffer}
                                            internship={selectedOffer} countNumberOfUnseenApplications={countNumberOfUnseenApplications} offers={allOffers}></InternshipApplications>
                }

                </div>
            </div>

        </div>
    )
}


