// Interfaces pour le dashboard et les offres de stage
export interface InternshipOffer {
  id?: number;
  jobTitle: string;
  taskDescription: string;
  qualifications: string;
  duration: number;
  startDate: string; // Format ISO: "2024-01-15"
  endDate: string;   // Format ISO: "2024-04-15"
  salary: number;
  address: string;
  validee?: boolean;
}

export interface CreateInternshipOfferRequest {
  jobTitle: string;
  taskDescription: string;
  qualifications: string;
  duration: number;
  startDate: string;
  salary: number;
  address: string;
}

export interface CreateOfferFormData {
  jobTitle: string;
  taskDescription: string;
  qualifications: string;
  duration: number;
  startDate: string;
  salary: number;
  address: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  expired: number;
}

export interface cv {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  fileName: string;
  uploadedAt?: string;
  validatedAt?: string;
  rejectionReason?: string
}
