import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';
import { dashboardService } from '../../services/dashboardService';
import StatisticsCard from './StatisticsCard';
import CreateOfferForm from './CreateOfferForm';
import OfferList from './OfferList';
import type { InternshipOffer, CreateOfferFormData } from '../../interfaces';

export default function DashboardContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<InternshipOffer[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Charger les offres existantes
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

  // Calculer les statistiques
  const stats = dashboardService.calculateStats(offers);

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCreateOffer = async (formData: CreateOfferFormData) => {
    setError(null);
    setSuccess(null);

    // Validation des données
    const validationError = dashboardService.validateOfferData(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      console.log('Création de l\'offre avec les données:', formData);
      const response = await dashboardService.createInternshipOffer(formData);
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
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
    expired: (
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête du dashboard */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
              <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
            </div>
            <div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showCreateForm ? t('dashboard.cancel') : t('dashboard.createOffer')}
              </button>
            </div>
          </div>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatisticsCard
            title={t('dashboard.totalOffers')}
            value={stats.total}
            icon={statsIcons.total}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatisticsCard
            title={t('dashboard.pending')}
            value={stats.pending}
            icon={statsIcons.pending}
            bgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatisticsCard
            title={t('dashboard.validated')}
            value={stats.approved}
            icon={statsIcons.approved}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatisticsCard
            title={t('dashboard.expired')}
            value={stats.expired}
            icon={statsIcons.expired}
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
        </div>

        {/* Formulaire de création d'offre */}
        {showCreateForm && (
          <CreateOfferForm
            onSubmit={handleCreateOffer}
            onCancel={() => setShowCreateForm(false)}
            loading={loading}
          />
        )}

        {/* Liste des offres existantes */}
        <OfferList offers={offers} loading={loading} />
      </div>
    </main>
  );
}
