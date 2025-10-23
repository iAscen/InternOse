// Interfaces pour le dashboard et les offres de stage
export interface InternshipOffer {
  id?: number;
  title: string;
  description: string;
  program: string;
  requiredSkills: string;
  duration: number;
  startDate: string; // Format ISO: "2024-01-15"
  endDate: string;   // Format ISO: "2024-04-15"
  salary: number;
  address: string;
  validee?: boolean;
  verificationStatus?: string; // "APPROVED", "REJECTED", "PENDING"
  rejectionReason?: string; // Raison du rejet si applicable
}

export interface CreateInternshipOfferRequest {
  title: string;
  description: string;
  program: string;
  requiredSkills: string;
  duration: number;
  startDate: string;
  salary: number;
  address: string;
}

export interface CreateOfferFormData {
  jobTitle: string;
  taskDescription: string;
  program: string;
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
  rejected: number;
}

export interface Cv {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  institution: string;
  applicationDate?: string;
  applicationStatus?: string;
  cvStatus: string;
  cvFileName: string;
  cvFileType: string;
  uploadedAt?: string;
  validatedAt?: string;
  rejectionReason?: string;
}