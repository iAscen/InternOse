// Constantes pour les chemins API - synchronisées avec le backend Paths.java
export const API_PATHS = {
  // Base
  API_BASE_URL: 'http://localhost:8080/api',
  
  // Authentification
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    EMPLOYER_REGISTER: '/auth/employer/register',
    STUDENT_REGISTER: '/auth/student/register',
  },
  
  // Employeur
  EMPLOYER: {
    BASE: '/employer',
    INTERNSHIP_OFFERS: '/employer/internship-offers',
    APPLICATIONS: '/employer/internship-offers/student-applications',
    APPLICATION_DETAILS: '/employer/internship-offers/student-applications/{studentID}',
    INTERVIEWS: '/employer/interviews',
    SCHEDULE_INTERVIEW: '/employer/interviews',
  },
  
  // Étudiant
  STUDENT: {
    BASE: '/student',
    RESUME: '/student/resume',
    RESUME_STATUS: '/student/resume',
    INTERNSHIP_OFFERS: '/student/internship-offers',
    SEARCH_INTERNSHIP_OFFERS: '/student/internship-offers',
    INTERNSHIP_OFFER_DETAILS: '/student/internship-offers/{offerID}',
    APPLY_INTERNSHIP: '/student/internship-offers/{offerID}/apply-to-internship',
    APPLICATIONS: '/student/applications',
  },
  
  // Gestionnaire de stages
  INTERNSHIP_MANAGER: {
    BASE: '/internship-manager',
    OFFERS: '/internship-manager/employers/internship-offers',
    VALIDATION: '/internship-manager/validation',
    SEARCH: '/internship-manager/employers/internship-offers',
    VERIFY_OFFER: '/internship-manager/verify',
    STUDENTS_CVS: '/internship-manager/students/resumes',
    RESUME: '/internship-manager/students/{studentID}/resume',
    DOWNLOAD_RESUME: '/internship-manager/students/{studentID}/resume/download',
    VERIFY_RESUME: '/internship-manager/students/{studentID}/resume/verify',
  },
} as const;

// Fonction utilitaire pour remplacer les paramètres dans les URLs
export function buildApiPath(path: string, params: Record<string, string | number> = {}): string {
  let builtPath = path;
  Object.entries(params).forEach(([key, value]) => {
    builtPath = builtPath.replace(`{${key}}`, String(value));
  });
  return builtPath;
}

// Fonction utilitaire pour construire l'URL complète
export function buildFullApiUrl(path: string, params: Record<string, string | number> = {}): string {
  const builtPath = buildApiPath(path, params);
  return `${API_PATHS.API_BASE_URL}${builtPath}`;
}
