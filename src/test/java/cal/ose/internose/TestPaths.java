package cal.ose.internose;

import cal.ose.internose.security.Paths;

/**
 * Constantes pour les chemins de test - synchronisées avec Paths.java
 * Utilisées dans les tests d'intégration pour éviter les routes hardcodées
 */
public class TestPaths {

    // Base
    public static final String API_BASE_PATH = Paths.API_BASE_PATH;

    // Authentification
    public static final String AUTH_BASE_PATH = Paths.AUTH_BASE_PATH;
    public static final String EMPLOYER_REGISTER_PATH = Paths.EMPLOYER_REGISTER_PATH;
    public static final String STUDENT_REGISTER_PATH = Paths.STUDENT_REGISTER_PATH;
    public static final String LOGIN_PATH = Paths.LOGIN_PATH;

    // Employeur
    public static final String EMPLOYER_BASE_PATH = Paths.EMPLOYER_BASE_PATH;
    public static final String EMPLOYER_INTERNSHIP_OFFERS_PATH = Paths.EMPLOYER_INTERNSHIP_OFFERS_PATH;
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_PATH = Paths.EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATIONS_PATH;
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATION_DETAILS_PATH = Paths.EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATION_DETAILS_PATH;
    public static final String EMPLOYER_INTERVIEWS_PATH = Paths.EMPLOYER_INTERVIEWS_PATH;
    public static final String EMPLOYER_SCHEDULE_INTERVIEW_PATH = Paths.EMPLOYER_INTERVIEWS_PATH;

    // Étudiant
    public static final String STUDENT_BASE_PATH = Paths.STUDENT_BASE_PATH;
    public static final String STUDENT_RESUME_PATH = Paths.STUDENT_RESUME_PATH;
    public static final String STUDENT_RESUME_STATUS_PATH = Paths.STUDENT_RESUME_STATUS_PATH;
    public static final String STUDENT_INTERNSHIP_OFFERS_LIST_PATH = Paths.STUDENT_INTERNSHIP_OFFERS_LIST_PATH;
    public static final String STUDENT_SEARCH_INTERNSHIP_OFFERS_LIST_PATH = Paths.STUDENT_INTERNSHIP_OFFERS_LIST_PATH;
    public static final String STUDENT_INTERNSHIP_OFFER_DETAILS_PATH = Paths.STUDENT_INTERNSHIP_OFFER_DETAILS_PATH;
    public static final String STUDENT_APPLY_INTERNSHIP_PATH = Paths.STUDENT_APPLY_TO_INTERNSHIP_OFFER_PATH;

    // Gestionnaire de stages
    public static final String INTERNSHIP_MANAGER_BASE_PATH = Paths.INTERNSHIP_MANAGER_BASE_PATH;
    public static final String INTERNSHIP_MANAGER_OFFERS_PATH = Paths.INTERNSHIP_MANAGER_OFFERS_PATH;
    public static final String INTERNSHIP_MANAGER_VALIDATION_PATH = Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH;
    public static final String INTERNSHIP_MANAGER_SEARCH_PATH = Paths.INTERNSHIP_MANAGER_OFFERS_PATH;
    public static final String INTERNSHIP_MANAGER_VERIFY_OFFER_PATH = Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH;
    public static final String INTERNSHIP_MANAGER_STUDENTS_CVS_PATH = Paths.INTERNSHIP_MANAGER_RESUMES_PATH;
    public static final String INTERNSHIP_MANAGER_RESUMES_PATH = Paths.INTERNSHIP_MANAGER_RESUMES_PATH;
    public static final String INTERNSHIP_MANAGER_RESUME_PATH = Paths.INTERNSHIP_MANAGER_RESUME_PATH;
    public static final String INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH = Paths.INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH;
    public static final String INTERNSHIP_MANAGER_VERIFY_RESUME_PATH = Paths.INTERNSHIP_MANAGER_VERIFY_RESUME_PATH;

    // Méthodes utilitaires pour construire les URLs avec paramètres
    public static String buildStudentResumeStatusUrl(Long studentId) {
        return STUDENT_RESUME_STATUS_PATH + "?studentID=" + studentId;
    }

    public static String buildStudentInternshipOffersUrl(Long studentId) {
        return STUDENT_INTERNSHIP_OFFERS_LIST_PATH + "?studentID=" + studentId;
    }

    public static String buildStudentSearchInternshipOffersUrl(Long studentId) {
        return STUDENT_SEARCH_INTERNSHIP_OFFERS_LIST_PATH + "?studentID=" + studentId;
    }

    public static String buildStudentInternshipOfferDetailsUrl(Long offerId) {
        return STUDENT_INTERNSHIP_OFFER_DETAILS_PATH.replace("{internshipOfferID}", String.valueOf(offerId));
    }

    public static String buildEmployerInternshipOffersUrl(Long employerId) {
        return EMPLOYER_INTERNSHIP_OFFERS_PATH + "?employerID=" + employerId;
    }

    public static String buildEmployerApplicationsUrl(Long internshipOfferId) {
        return EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_PATH + "?internshipOfferID=" + internshipOfferId;
    }

    public static String buildEmployerApplicationDetailsUrl(Long internshipOfferId, Long studentId) {
        return EMPLOYER_INTERNSHIP_OFFER_APPLICATION_DETAILS_PATH
            .replace("{studentID}", String.valueOf(studentId)) + "?internshipOfferID=" + internshipOfferId;
    }

    public static String buildInternshipManagerStudentsCvsUrl() {
        return INTERNSHIP_MANAGER_STUDENTS_CVS_PATH;
    }

    public static String buildInternshipManagerResumeUrl(Long studentId) {
        return INTERNSHIP_MANAGER_RESUME_PATH.replace("{studentID}", String.valueOf(studentId));
    }

    public static String buildInternshipManagerDownloadResumeUrl(Long studentId) {
        return INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH.replace("{studentID}", String.valueOf(studentId));
    }

    public static String buildInternshipManagerVerifyResumeUrl(Long studentId) {
        return INTERNSHIP_MANAGER_VERIFY_RESUME_PATH.replace("{studentID}", String.valueOf(studentId));
    }

    public static String buildEmployerScheduleInterviewUrl(Long internshipOfferId, Long studentId) {
        return EMPLOYER_SCHEDULE_INTERVIEW_PATH + "?internshipOfferID=" + internshipOfferId + "&studentID=" + studentId;
    }

    public static String buildEmployerInterviewsUrl(Long employerId) {
        return EMPLOYER_INTERVIEWS_PATH + "?employerID=" + employerId;
    }

//    public static String buildEmployerUpdateApplicationStatusUrl(Long internshipOfferId, Long studentId) {
//        return Paths.EMPLOYER_UPDATE_APPLICATION_STATUS_PATH
//            .replace("{internshipOfferID}", String.valueOf(internshipOfferId))
//            .replace("{studentID}", String.valueOf(studentId));
//    }

    public static String buildStudentRespondToOfferUrl(Long internshipOfferId, Long studentId) {
        return Paths.STUDENT_RESPOND_TO_OFFER_PATH
            .replace("{internshipOfferID}", String.valueOf(internshipOfferId))
            + "?studentID=" + studentId;
    }
}