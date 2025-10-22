package cal.ose.internose.security;

public class Paths {
    public static final String API_BASE_PATH = "/api";

    // Utilisateur
    public static final String AUTH_BASE_PATH = API_BASE_PATH + "/auth";
    public static final String EMPLOYER_REGISTER_PATH = AUTH_BASE_PATH + "/employer/register";
    public static final String STUDENT_REGISTER_PATH = AUTH_BASE_PATH + "/student/register";
    public static final String LOGIN_PATH = AUTH_BASE_PATH + "/login";

    // Employeur
    public static final String EMPLOYER_BASE_PATH = API_BASE_PATH + "/employer";
    public static final String EMPLOYER_INTERNSHIP_OFFERS_PATH = EMPLOYER_BASE_PATH + "/internship-offers";
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_PATH = EMPLOYER_INTERNSHIP_OFFERS_PATH + "/applications";
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATION_DETAILS_PATH = EMPLOYER_INTERNSHIP_OFFERS_PATH + "/applications/{studentID}";
    
    // Employeur - Chemins relatifs pour les contrôleurs
    public static final String EMPLOYER_INTERNSHIP_OFFERS_RELATIVE = "/internship-offers";
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_RELATIVE = "/internship-offers/applications";
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATION_DETAILS_RELATIVE = "/internship-offers/applications/{studentID}";
    
    // Étudiant
    public static final String STUDENT_BASE_PATH = API_BASE_PATH + "/student";
    public static final String STUDENT_RESUME_PATH = STUDENT_BASE_PATH + "/resume";
    public static final String STUDENT_RESUME_STATUS_PATH = STUDENT_RESUME_PATH + "/status";
    public static final String STUDENT_INTERNSHIP_OFFERS_LIST_PATH = STUDENT_BASE_PATH + "/internship-offers";
    public static final String STUDENT_SEARCH_INTERNSHIP_OFFERS_LIST_PATH = STUDENT_INTERNSHIP_OFFERS_LIST_PATH + "/search";
    public static final String STUDENT_INTERNSHIP_OFFER_DETAILS_PATH = STUDENT_INTERNSHIP_OFFERS_LIST_PATH + "/{offerID}";
    public static final String STUDENT_APPLY_INTERNSHIP_PATH = STUDENT_BASE_PATH + "/apply-internship";
    
    // Étudiant - Chemins relatifs pour les contrôleurs
    public static final String STUDENT_RESUME_RELATIVE = "/resume";
    public static final String STUDENT_RESUME_STATUS_RELATIVE = "/resume/status";
    public static final String STUDENT_INTERNSHIP_OFFERS_RELATIVE = "/internship-offers";
    public static final String STUDENT_SEARCH_INTERNSHIP_OFFERS_RELATIVE = "/internship-offers/search";
    public static final String STUDENT_INTERNSHIP_OFFER_DETAILS_RELATIVE = "/internship-offers/{offerID}";
    public static final String STUDENT_APPLY_INTERNSHIP_RELATIVE = "/apply-internship";

    // Gestionnaire de stages
    public static final String INTERNSHIP_MANAGER_BASE_PATH = API_BASE_PATH + "/internship-manager";
    public static final String INTERNSHIP_MANAGER_OFFERS_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/employers/internship-offers";
    public static final String INTERNSHIP_MANAGER_VALIDATION_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/validation";
    public static final String INTERNSHIP_MANAGER_SEARCH_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/search";
    public static final String INTERNSHIP_MANAGER_VERIFY_OFFER_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/verify";
    public static final String INTERNSHIP_MANAGER_STUDENTS_CVS_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/students/cvs";
    public static final String INTERNSHIP_MANAGER_RESUMES_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/students/resumes";
    public static final String INTERNSHIP_MANAGER_RESUME_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/students/{studentID}/cv";
    public static final String INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH = INTERNSHIP_MANAGER_RESUME_PATH + "/download";
    public static final String INTERNSHIP_MANAGER_VERIFY_RESUME_PATH = INTERNSHIP_MANAGER_RESUME_PATH + "/validate";
    
    // Gestionnaire de stages - Chemins relatifs pour les contrôleurs
    public static final String INTERNSHIP_MANAGER_OFFERS_RELATIVE = "/employers/internship-offers";
    public static final String INTERNSHIP_MANAGER_VALIDATION_RELATIVE = "/validation";
    public static final String INTERNSHIP_MANAGER_SEARCH_RELATIVE = "/search";
    public static final String INTERNSHIP_MANAGER_VERIFY_OFFER_RELATIVE = "/verify";
    public static final String INTERNSHIP_MANAGER_STUDENTS_CVS_RELATIVE = "/students/cvs";
    public static final String INTERNSHIP_MANAGER_RESUME_RELATIVE = "/students/{studentID}/cv";
    public static final String INTERNSHIP_MANAGER_DOWNLOAD_RESUME_RELATIVE = "/students/{studentID}/cv/download";
    public static final String INTERNSHIP_MANAGER_VERIFY_RESUME_RELATIVE = "/students/{studentID}/cv/validate";
}
