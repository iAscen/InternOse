import { apiService } from './apiService';
import type { 
  InternshipOffer, 
  CreateInternshipOfferRequest, 
  DashboardStats, 
  ApiResponse 
} from '../interfaces';

class DashboardService {
  // Récupérer toutes les offres de stage de l'employeur
  async getInternshipOffers(): Promise<ApiResponse<InternshipOffer[]>> {
    return await apiService.getInternshipOffers();
  }

  // Créer une nouvelle offre de stage
  async createInternshipOffer(offerData: CreateInternshipOfferRequest): Promise<ApiResponse<string>> {
    return await apiService.createInternshipOffer(offerData);
  }

  // Calculer les statistiques du dashboard
  calculateStats(offers: InternshipOffer[]): DashboardStats {
    const now = new Date();
    const total = offers.length;
    const pending = offers.filter(offer => !offer.validee).length;
    const approved = offers.filter(offer => offer.validee).length;
    const expired = offers.filter(offer => new Date(offer.endDate) < now).length;
    
    return { total, pending, approved, expired };
  }

  // Valider les données du formulaire
  validateOfferData(data: CreateInternshipOfferRequest): string | null {
    if (!data.jobTitle || !data.taskDescription || !data.qualifications || 
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
