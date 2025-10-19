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

    // Étudiant
    public static final String STUDENT_BASE_PATH = API_BASE_PATH + "/student";
    public static final String STUDENT_RESUME_PATH = STUDENT_BASE_PATH + "/resume";
    public static final String STUDENT_RESUME_STATUS_PATH = STUDENT_RESUME_PATH + "/status";

    // Gestionnaire de stages
    public static final String INTERNSHIP_MANAGER_BASE_PATH = API_BASE_PATH + "/internship-manager";
    public static final String INTERNSHIP_MANAGER_OFFERS_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/employers/internships";
    public static final String INTERNSHIP_MANAGER_VERIFY_OFFER_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/verify";
    public static final String INTERNSHIP_MANAGER_RESUMES_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/students/resumes";
    public static final String INTERNSHIP_MANAGER_RESUME_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/students/{studentID}/cv";
    public static final String INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH = INTERNSHIP_MANAGER_RESUME_PATH + "/download";
    public static final String INTERNSHIP_MANAGER_VERIFY_RESUME_PATH = INTERNSHIP_MANAGER_RESUME_PATH + "/verify";
}
