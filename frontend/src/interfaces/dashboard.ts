// Interfaces pour le dashboard et les offres de stage
export interface InternshipOffer {
  id: number;
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
  applicationStatus?: string; // "PENDING", "PENDING_INTERVIEW", "ACCEPTED", "REJECTED"
  applicationId: number;
  session: string;
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
  seenStatus?: string; // UNSEEN SEEN NONE
  cvStatus: string;
  cvFileName: string;
  cvFileType: string;
  uploadedAt?: string;
  validatedAt?: string;
  rejectionReason?: string;
}

export interface StudentApplication {
  studentFirstName: string;
  studentLastName: string;
  internshipOfferTitle: string;
  internshipOfferAddress: string;
  internshipOfferStartDate: string;
  internshipOfferEndDate: string;
  internshipOfferDuration: number;
  applicationDate: string;
  applicationStatus: string;
}

export interface InterviewInvitation {
  id?: number;
  studentId: number;
  internshipOfferId: number;
  interviewDate: string; // Format ISO: "2024-01-15T14:30:00"
  interviewMode: 'ONLINE' | 'IN_PERSON';
  location?: string; // Lieu physique ou lien de réunion
  message?: string; // Message personnalisé
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInterviewInvitationRequest {
  studentId: number;
  internshipOfferId: number;
  interviewDate: string;
  interviewMode: 'ONLINE' | 'IN_PERSON';
  location?: string;
  message?: string;
}

export interface UnseenApplicationsCount {
  studentsWhoRejectedTheOffer: number,
  studentsWhoAcceptedTheOffer: number
}

export interface InternshipContract {
  id: number;
  startDate: string; // Format ISO: "2024-01-15"
  endDate: string;   // Format ISO: "2024-04-15"
  weeklyHours: number;
  tasks: string;
  educationalObjectives: string;
  supervisorName: string;
  supervisorTitle: string;
  supervisorEmail: string;
  supervisorPhone: string;
  isSignedStudent: boolean;
  isSignedEmployer: boolean;
  isSignedInternshipManager: boolean;
  studentId?: number;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentProgram?: string;
  employerId?: number;
  employerCompany?: string;
  internshipOfferId?: number;
  internshipOfferTitle?: string;
  internshipOfferAddress?: string;
  internshipOfferSession?: string;
  professorFirstName?: string;
  professorLastName?: string;
  professorEmail?: string;
  professorId?: number;
}

export interface Professor {
  id: number,
  firstName: string,
  lastName: string,
}

// Enums pour l'évaluation du stagiaire
export type AssessmentOptions =
  | 'COMPLETELY_AGREE'
  | 'PARTIALLY_AGREE'
  | 'PARTIALLY_DISAGREE'
  | 'COMPLETELY_DISAGREE'
  | 'NOT_APPLICABLE';

export type OverallInternAppreciation =
  | 'GREATLY_EXCEEDS_EXPECTATIONS'
  | 'EXCEEDS_EXPECTATIONS'
  | 'FULLY_MEETS_EXPECTATIONS'
  | 'PARTIALLY_MEETS_EXPECTATIONS'
  | 'DOES_NOT_MEET_EXPECTATIONS';

export type FutureCollaboration = 'YES' | 'MAYBE' | 'NO';

export interface InternAssessment {
  studentName: string;
  studentProgram: string;
  companyName: string;
  supervisorName: string;
  supervisorTitle: string;
  supervisorPhoneNumber: string;
  internAssessment: Record<string, AssessmentOptions>;
  internAssessmentComments: Record<string, string>;
  overallInternAppreciation: OverallInternAppreciation;
  appreciationComment: string;
  discussedWithTheIntern: boolean;
  weeklySupervisionHours: number;
  futureCollaboration: FutureCollaboration;
  academicPreparationAdequacy: string;
  signerName: string;
  signerTitle: string;
  signature: string;
  signatureDate: string;
}

// Enums pour l'évaluation du milieu de stage
export type SiteAssessmentOptions =
  | 'COMPLETELY_AGREE'
  | 'PARTIALLY_AGREE'
  | 'PARTIALLY_DISAGREE'
  | 'COMPLETELY_DISAGREE'
  | 'NOT_APPLICABLE';

export type OverallSiteAppreciation =
  | 'EXCELLENT'
  | 'VERY_GOOD'
  | 'GOOD'
  | 'SATISFACTORY'
  | 'UNSATISFACTORY';

export type Recommendation =
  | 'STRONGLY_RECOMMEND'
  | 'RECOMMEND'
  | 'RECOMMEND_WITH_RESERVATIONS'
  | 'DO_NOT_RECOMMEND';

export interface SiteAssessment {
  studentName: string;
  companyName: string;
  supervisorName: string;
  internshipPosition: string;
  internshipDuration: string;
  siteAssessment: Record<string, SiteAssessmentOptions>;
  siteAssessmentComments: Record<string, string>;
  overallSiteAppreciation: OverallSiteAppreciation;
  generalComments?: string;
  recommendation: Recommendation;
  hoursPerWeekFirstMonth?: number;
  hoursPerWeekSecondMonth?: number;
  hoursPerWeekThirdMonth?: number;
  variableWorkShifts?: boolean;
  workShiftTimes?: string; // Format: "De ____ à ____" (3 lignes possibles)
  professorName: string;
  signature: string;
  assessmentDate: string;
}
