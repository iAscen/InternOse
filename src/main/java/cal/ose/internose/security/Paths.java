package cal.ose.internose.security;

public class Paths {
    public static final String API_BASE_PATH = "/api";

    // Utilisateur
    public static final String EMPLOYER_REGISTER_PATH = API_BASE_PATH + "/auth/employer/register";
    public static final String STUDENT_REGISTER_PATH = API_BASE_PATH + "/auth/student/register";
    public static final String LOGIN_PATH = API_BASE_PATH + "/auth/login";

    // Employeur
    public static final String EMPLOYER_BASE_PATH = API_BASE_PATH + "/employer";
    public static final String EMPLOYER_INTERNSHIP_OFFERS_PATH = API_BASE_PATH + "/employer/internship-offers";
    public static final String EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATIONS_PATH = API_BASE_PATH + "/employer/internship-offers/student-applications";
    public static final String EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATION_DETAILS_PATH = API_BASE_PATH + "/employer/internship-offers/student-applications/{studentID}";
    public static final String EMPLOYER_INTERVIEWS_PATH = API_BASE_PATH + "/employer/interviews";

    // Étudiant
    public static final String STUDENT_BASE_PATH = API_BASE_PATH + "/student";
    public static final String STUDENT_RESUME_PATH = API_BASE_PATH + "/student/resume";
    public static final String STUDENT_RESUME_STATUS_PATH = API_BASE_PATH + "/student/resume/status";
    public static final String STUDENT_INTERNSHIP_OFFERS_LIST_PATH = API_BASE_PATH + "/student/internship-offers";
    public static final String STUDENT_INTERNSHIP_OFFER_DETAILS_PATH = API_BASE_PATH + "/student/internship-offers/{internshipOfferID}";
    public static final String STUDENT_APPLY_TO_INTERNSHIP_OFFER_PATH = API_BASE_PATH + "/student/internship-offers/{internshipOfferID}/apply-to-internship";
    public static final String STUDENT_APPLICATIONS_PATH = API_BASE_PATH + "/student/applications";

    // Gestionnaire de stages
    public static final String INTERNSHIP_MANAGER_BASE_PATH = API_BASE_PATH + "/internship-manager";
    public static final String INTERNSHIP_MANAGER_OFFERS_PATH = API_BASE_PATH + "/internship-manager/employers/internship-offers";
    public static final String INTERNSHIP_MANAGER_VERIFY_OFFER_PATH = API_BASE_PATH + "/internship-manager/verify";
    public static final String INTERNSHIP_MANAGER_RESUMES_PATH = API_BASE_PATH + "/internship-manager/students/resumes";
    public static final String INTERNSHIP_MANAGER_RESUME_PATH = API_BASE_PATH + "/internship-manager/students/{studentID}/resume";
    public static final String INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH = API_BASE_PATH + "/internship-manager/students/{studentID}/resume/download";
    public static final String INTERNSHIP_MANAGER_VERIFY_RESUME_PATH = API_BASE_PATH + "/internship-manager/students/{studentID}/resume/verify";

}
