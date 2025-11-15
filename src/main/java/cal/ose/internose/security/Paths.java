package cal.ose.internose.security;

public class Paths {
    public static final String API_BASE_PATH = "/api";

    // Auth
    public static final String AUTH_BASE_PATH = API_BASE_PATH + "/auth";
    public static final String EMPLOYER_REGISTER_PATH = AUTH_BASE_PATH + "/employer/register";
    public static final String STUDENT_REGISTER_PATH = AUTH_BASE_PATH + "/student/register";
    public static final String LOGIN_PATH = AUTH_BASE_PATH + "/login";
    public static final String SET_SESSION_PATH = AUTH_BASE_PATH + "/session";

    // User
    public static final String USER_BASE_PATH = API_BASE_PATH + "/user";
    public static final String USER_NOTIFICATIONS_PATH = USER_BASE_PATH + "/{userID}/notifications";

    // Employeur
    public static final String EMPLOYER_BASE_PATH = API_BASE_PATH + "/employer";
    public static final String EMPLOYER_INTERNSHIP_OFFERS_PATH = EMPLOYER_BASE_PATH + "/internship-offers";
    public static final String EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATIONS_PATH =
        EMPLOYER_INTERNSHIP_OFFERS_PATH + "/student-applications";
    public static final String EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATION_DETAILS_PATH =
        EMPLOYER_INTERNSHIP_OFFERS_PATH + "/student-applications/{studentID}";
    public static final String EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATION_STATUS_PATH =
        EMPLOYER_INTERNSHIP_OFFERS_PATH + "/{internshipOfferID}/student-applications/{studentID}/status";
    public static final String EMPLOYER_INTERVIEWS_PATH = EMPLOYER_BASE_PATH + "/interviews";
    public static final String EMPLOYER_APPLICATIONS_COUNT_UNSEEN_PATH = EMPLOYER_BASE_PATH + "/{offerID}/applications/count-unseen";
    public static final String EMPLOYER_APPLICATIONS_MAKE_SEEN =  EMPLOYER_BASE_PATH + "/{offerID}/applications/make-seen";
    public static final String EMPLOYER_CONTRACT_PATH =
        EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATION_DETAILS_PATH + "/contract";
    public static final String EMPLOYER_SIGN_CONTRACT_PATH = EMPLOYER_CONTRACT_PATH + "/sign";
    public static final String EMPLOYER_INTERN_ASSESSMENT_PATH = EMPLOYER_BASE_PATH + "/intern-assessment";

    // Étudiant
    public static final String STUDENT_BASE_PATH = API_BASE_PATH + "/student";
    public static final String STUDENT_RESUME_PATH = STUDENT_BASE_PATH + "/resume";
    public static final String STUDENT_RESUME_STATUS_PATH = STUDENT_RESUME_PATH + "/status";
    public static final String STUDENT_INTERNSHIP_OFFERS_LIST_PATH = STUDENT_BASE_PATH + "/internship-offers";
    public static final String STUDENT_INTERNSHIP_OFFER_DETAILS_PATH =
        STUDENT_INTERNSHIP_OFFERS_LIST_PATH + "/{internshipOfferID}";
    public static final String STUDENT_APPLY_TO_INTERNSHIP_OFFER_PATH =
        STUDENT_INTERNSHIP_OFFER_DETAILS_PATH + "/apply-to-internship";
    public static final String STUDENT_APPLICATIONS_PATH = STUDENT_BASE_PATH + "/applications";
    public static final String STUDENT_RESPOND_TO_OFFER_PATH =
        STUDENT_INTERNSHIP_OFFER_DETAILS_PATH + "/respond";
    public static final String STUDENT_CONTRACT_PATH =
        STUDENT_INTERNSHIP_OFFER_DETAILS_PATH + "/contract";
    public static final String STUDENT_SIGN_CONTRACT_PATH =
        STUDENT_CONTRACT_PATH + "/sign";

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
    public static final String INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/contracts";
    public static final String INTERNSHIP_MANAGER_SIGN_CONTRACT_PATH = INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH + "/{contractId}/sign";
    public static final String INTERNSHIP_MANAGER_PROFESSORS_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/professors";
    public static final String INTERNSHIP_MANAGER_ASSIGN_PROFESSOR_TO_STUDENT_PATH = INTERNSHIP_MANAGER_PROFESSORS_PATH + "/{professorID}/assign";
}
