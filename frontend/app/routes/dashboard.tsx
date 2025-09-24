import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { apiService } from '../services/apiService';
import PageLayout from '../components/PageLayout';
import StatisticsCard from '../components/dashboard/StatisticsCard';
import CreateOfferForm from '../components/dashboard/CreateOfferForm';
import OfferList from '../components/dashboard/OfferList';

// Types basés sur le backend
interface InternshipOffer {
  id?: number;
  jobTitle: string;
  taskDescription: string;
  qualifications: string;
  duration: number;
  startDate: string;
  endDate: string;
  salary: number;
  address: string;
  validee?: boolean;
}

interface CreateOfferFormData {
  jobTitle: string;
  taskDescription: string;
  qualifications: string;
  duration: number;
  startDate: string;
  salary: number;
  address: string;
}

export default function Dashboard() {
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
      const token = apiService.getToken();
      const response = await fetch('http://localhost:8080/api/employer/internship-offers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      } else {
        setError('Erreur lors du chargement des offres');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = () => {
    const now = new Date();
    const total = offers.length;
    const pending = offers.filter(offer => !offer.validee).length;
    const approved = offers.filter(offer => offer.validee).length;
    const expired = offers.filter(offer => new Date(offer.endDate) < now).length;
    
    return { total, pending, approved, expired };
  };

  const stats = calculateStats();

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCreateOffer = async (formData: CreateOfferFormData) => {
    setError(null);
    setSuccess(null);

    // Validation des champs obligatoires
    if (!formData.jobTitle || !formData.taskDescription || !formData.qualifications || 
        !formData.duration || !formData.startDate || !formData.address) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const token = apiService.getToken();
      const response = await fetch('http://localhost:8080/api/employer/internship-offers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Offre de stage créée avec succès ! Elle est en attente de validation.');
        setShowCreateForm(false);
        loadOffers(); // Recharger la liste
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la création de l\'offre');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.removeToken();
    navigate('/login');
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
    <PageLayout>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête du dashboard */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-600 mt-2">Gérez vos offres de stage</p>
              </div>
              <div>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showCreateForm ? 'Annuler' : 'Créer une offre'}
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
              title="Total des offres"
              value={stats.total}
              icon={statsIcons.total}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatisticsCard
              title="En attente"
              value={stats.pending}
              icon={statsIcons.pending}
              bgColor="bg-yellow-100"
              iconColor="text-yellow-600"
            />
            <StatisticsCard
              title="Validées"
              value={stats.approved}
              icon={statsIcons.approved}
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <StatisticsCard
              title="Expirées"
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
    </PageLayout>
  );
}

