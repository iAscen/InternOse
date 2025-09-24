import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { apiService } from '../services/apiService';
import PageLayout from '../components/PageLayout';
import Footer from '../components/Footer';

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
  
  const [formData, setFormData] = useState<CreateOfferFormData>({
    jobTitle: '',
    taskDescription: '',
    qualifications: '',
    duration: 0,
    startDate: '',
    salary: 0,
    address: ''
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'salary' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setFormData({
        jobTitle: '',
        taskDescription: '',
        qualifications: '',
        duration: 0,
        startDate: '',
        salary: 0,
        address: ''
        });
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
            {/* Total des offres */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total des offres</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            {/* Offres en attente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">En attente</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            {/* Offres validées */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Validées</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            {/* Offres expirées */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Expirées</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.expired}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de création d'offre */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Créer une nouvelle offre de stage</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du poste *
                    </label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Ex: Développeur Full Stack"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu du stage *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Ex: Montréal, QC"
                    />
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Durée (en semaines) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      La date de fin sera calculée automatiquement
                    </p>
                  </div>

                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                      Rémunération (par semaine)
                    </label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                </div>

                <div>
                  <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description détaillée des tâches *
                  </label>
                  <textarea
                    id="taskDescription"
                    name="taskDescription"
                    value={formData.taskDescription}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Décrivez les tâches que l'étudiant devra accomplir..."
                  />
                </div>

                <div>
                  <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-2">
                    Compétences requises *
                  </label>
                  <textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Ex: Java, Spring Boot, React, SQL..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Créer l\'offre'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des offres existantes */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Mes offres de stage</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Chargement...</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>Aucune offre de stage créée pour le moment.</p>
                <p className="mt-2">Cliquez sur "Créer une offre" pour commencer.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {offers.map((offer, index) => (
                  <div key={offer.id || index} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{offer.jobTitle}</h3>
                        <p className="text-gray-600 mt-1">{offer.address}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {offer.startDate} - {offer.endDate} ({offer.duration} semaines)
                        </p>
                        {offer.salary > 0 && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            ${offer.salary}/semaine
                          </p>
                        )}
                        <div className="mt-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            offer.validee 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {offer.validee ? 'Validée' : 'En attente de validation'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-700">
                        <strong>Description :</strong> {offer.taskDescription}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Compétences requises :</strong> {offer.qualifications}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </PageLayout>
  );
}

