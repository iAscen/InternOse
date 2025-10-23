import { apiService } from './apiService';
import type {
  InternshipOffer,
  CreateInternshipOfferRequest,
  DashboardStats,
  ApiResponse,
  Cv
} from '../interfaces';

class DashboardService {
  // Récupérer toutes les offres de stage de l'employeur
  async getInternshipOffers(): Promise<ApiResponse<InternshipOffer[]>> {
    return await apiService.getInternshipOffers();
  }

  // Récupérer toutes les offres de stages de tous les employeurs (pour le gestionnaire de stages)
  async getAllInternshipOffers(sortBy?: string, filterBy?: string[]): Promise<ApiResponse<InternshipOffer[]>> {
    return await apiService.getAllInternshipOffers(sortBy, filterBy);
  }

  async StudentGetInternships(StudentId: number | null, sortBy?: string, filterBy?: string[]): Promise<ApiResponse<InternshipOffer[]>> {
    return await apiService.StudentGetInternshipOffers(StudentId, sortBy, filterBy);
  }

  async StudentGetAllInternshipOffers(sortBy?: string, filterBy?: string[]): Promise<ApiResponse<InternshipOffer[]>> {
    return await apiService.StudentGetAllInternshipOffers(sortBy, filterBy);
  }

  // Créer une nouvelle offre de stage
  async createInternshipOffer(offerData: CreateInternshipOfferRequest): Promise<ApiResponse<string>> {
    return await apiService.createInternshipOffer(offerData);
  }

  async getAllCvs(sortBy?: string, filterBy?: string[], sortOrder?: string): Promise<ApiResponse<Cv[]>> {
    return await apiService.getAllCvs(sortBy, filterBy, sortOrder)
  }

  // Calculer les statistiques du dashboard
  calculateStats(offers: InternshipOffer[]): DashboardStats {
    const total = offers.length;
    const pending = offers.filter(offer => 
      !offer.verificationStatus || 
      offer.verificationStatus === 'PENDING' || 
      offer.verificationStatus === 'pending'
    ).length;
    const approved = offers.filter(offer => 
      offer.verificationStatus === 'APPROVED' || 
      offer.verificationStatus === 'approved'
    ).length;
    const rejected = offers.filter(offer => 
      offer.verificationStatus === 'REJECTED' || 
      offer.verificationStatus === 'rejected'
    ).length;

    return { total, pending, approved, rejected };
  }

  // Valider les données du formulaire
  validateOfferData(data: CreateInternshipOfferRequest): string | null {
    if (!data.title || !data.description || !data.requiredSkills ||
      !data.duration || !data.startDate || !data.address) {
      return 'Veuillez remplir tous les champs obligatoires';
    }

    if (data.duration <= 0) {
      return 'La durée doit être supérieure à 0';
    }

    if (data.salary < 0) {
      return 'Le salaire ne peut pas être négatif';
    }

    const startDate = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return 'La date de début ne peut pas être dans le passé';
    }

    return null;
  }
}

export const dashboardService = new DashboardService();
