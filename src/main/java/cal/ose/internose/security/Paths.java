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
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_PATH =
        EMPLOYER_INTERNSHIP_OFFERS_PATH + "/applications";
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATION_DETAILS_PATH =
        EMPLOYER_INTERNSHIP_OFFERS_PATH + "/applications/{studentID}";
    public static final String EMPLOYER_INTERVIEWS_PATH = EMPLOYER_BASE_PATH + "/interviews";
    public static final String EMPLOYER_SCHEDULE_INTERVIEW_PATH = EMPLOYER_BASE_PATH + "/interviews/schedule";

    // Employeur - Chemins relatifs pour les contrôleurs
    public static final String EMPLOYER_INTERNSHIP_OFFERS_RELATIVE = "/internship-offers";
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_RELATIVE =
        EMPLOYER_INTERNSHIP_OFFERS_RELATIVE + "/applications";
    public static final String EMPLOYER_INTERNSHIP_OFFER_APPLICATION_DETAILS_RELATIVE =
        EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_RELATIVE + "/{studentID}";
    public static final String EMPLOYER_INTERVIEWS_RELATIVE = "/interviews";
    public static final String EMPLOYER_SCHEDULE_INTERVIEW_RELATIVE = "/interviews/schedule";

    // Étudiant
    public static final String STUDENT_BASE_PATH = API_BASE_PATH + "/student";
    public static final String STUDENT_RESUME_PATH = STUDENT_BASE_PATH + "/resume";
    public static final String STUDENT_RESUME_STATUS_PATH = STUDENT_RESUME_PATH + "/status";
    public static final String STUDENT_INTERNSHIP_OFFERS_LIST_PATH = STUDENT_BASE_PATH + "/internship-offers";
    public static final String STUDENT_SEARCH_INTERNSHIP_OFFERS_LIST_PATH =
        STUDENT_INTERNSHIP_OFFERS_LIST_PATH + "/browser";
    public static final String STUDENT_INTERNSHIP_OFFER_DETAILS_PATH =
        STUDENT_INTERNSHIP_OFFERS_LIST_PATH + "/{offerID}";
    public static final String STUDENT_APPLY_INTERNSHIP_PATH = STUDENT_BASE_PATH + "/apply-to-internship";

    // Étudiant - Chemins relatifs pour les contrôleurs
    public static final String STUDENT_RESUME_RELATIVE = "/resume";
    public static final String STUDENT_RESUME_STATUS_RELATIVE = STUDENT_RESUME_RELATIVE + "/status";
    public static final String STUDENT_INTERNSHIP_OFFERS_RELATIVE = "/internship-offers";
    public static final String STUDENT_INTERNSHIP_OFFER_DETAILS_RELATIVE =
        STUDENT_INTERNSHIP_OFFERS_RELATIVE + "/{internshipOfferID}";
    public static final String STUDENT_APPLY_TO_INTERNSHIP_RELATIVE = "/apply-to-internship";
    public static final String STUDENT_APPLICATIONS_RELATIVE = "/applications";

    // Gestionnaire de stages
    public static final String INTERNSHIP_MANAGER_BASE_PATH = API_BASE_PATH + "/internship-manager";
    public static final String INTERNSHIP_MANAGER_OFFERS_PATH =
        INTERNSHIP_MANAGER_BASE_PATH + "/employers/internship-offers";
    public static final String INTERNSHIP_MANAGER_VERIFY_OFFER_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/verify";
    public static final String INTERNSHIP_MANAGER_RESUMES_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/students/resumes";
    public static final String INTERNSHIP_MANAGER_RESUME_PATH =
        INTERNSHIP_MANAGER_BASE_PATH + "/students/{studentID}/resume";
    public static final String INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH = INTERNSHIP_MANAGER_RESUME_PATH + "/download";
    public static final String INTERNSHIP_MANAGER_VERIFY_RESUME_PATH = INTERNSHIP_MANAGER_RESUME_PATH + "/verify";

    // Gestionnaire de stages - Chemins relatifs pour les contrôleurs
    public static final String INTERNSHIP_MANAGER_OFFERS_RELATIVE = "/employers/internship-offers";
    public static final String INTERNSHIP_MANAGER_VERIFY_OFFER_RELATIVE = "/verify";
    public static final String INTERNSHIP_MANAGER_RESUMES_RELATIVE = "/students/resumes";
    public static final String INTERNSHIP_MANAGER_RESUME_RELATIVE = "/students/{studentID}/resume";
    public static final String INTERNSHIP_MANAGER_DOWNLOAD_RESUME_RELATIVE =
        INTERNSHIP_MANAGER_RESUME_RELATIVE + "/download";
    public static final String INTERNSHIP_MANAGER_VERIFY_RESUME_RELATIVE =
        INTERNSHIP_MANAGER_RESUME_RELATIVE + "/verify";
}
