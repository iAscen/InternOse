import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { apiService } from "~/services/apiService";
import { dashboardService } from "~/services/dashboardService";
import type { InternshipOffer } from "~/interfaces";
import OfferList from "~/components/dashboard/OfferList";
import SortButton from "~/components/dashboard/SortButton";
import FilterButton from "~/components/dashboard/FilterButton";

export default function IMDashboardContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [offers, setOffers] = useState<InternshipOffer[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Vérifier l'authentification au chargement
    useEffect(() => {
        if (!apiService.isAuthenticated()) {
            navigate('/login');
        } else {
            const userRole = apiService.getUserRole();
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

    // Charger les offres de stage
    const loadOffers = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getAllInternshipOffers();
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
    useEffect(() => {
        loadOffers();
    }, []);

    return (
        <div>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {t('im.dashboard')}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {t("im.dashboardSubtitle")}
                        </p>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{t("im.pendingSubmissions")}</p>
                                    <p className="text-2xl font-semibold text-gray-900">0</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{t("im.approvedSubmissions")}</p>
                                    <p className="text-2xl font-semibold text-gray-900">0</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{t("im.refusedSubmissions")}</p>
                                    <p className="text-2xl font-semibold text-gray-900">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section "Offres de stages des employeurs" */}
                    <div className="bg-white rounded-lg shadow-md mb-8 p-6">
                        <div className="flex items-center space-x-10 flex-shrink-0 mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {t("im.internshipOffersSection")}
                            </h2>
                            <SortButton />
                            <FilterButton />
                        </div>
                        <p className="text-gray-600">
                            <OfferList isEmployer={false} loading={loading} offers={offers}/>
                        </p>
                    </div>

                    {/* Section "Candidatures (CVs) des étudiants" */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center space-x-10 flex-shrink-0 mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {t("im.resumesSection")}
                            </h2>
                            <SortButton />
                            <FilterButton />
                        </div>
                        <p className="text-gray-600">
                            Cette section sera bientôt disponible.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
