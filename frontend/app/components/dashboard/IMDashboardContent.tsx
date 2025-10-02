import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { apiService } from "~/services/apiService";
import { dashboardService } from "~/services/dashboardService";
import type { InternshipOffer } from "~/interfaces";

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
        }
    }, [navigate]);

    // Charger les offres de stage
    const loadOffers = async () => {
        try {
            setLoading(true);
            console.log('Chargement des offres...');
            const response = await dashboardService.getInternshipOffers();
            console.log('Réponse du serveur:', response);

            if (response.success && response.data) {
                console.log('Offres chargées:', response.data);
                setOffers(response.data);
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

    return (
        <div>

        </div>
    )
}
