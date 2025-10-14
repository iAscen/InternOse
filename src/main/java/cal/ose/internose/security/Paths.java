package cal.ose.internose.security;

public class Paths {
    public static final String API_BASE_PATH = "/api";

    public static final String AUTH_BASE_PATH = API_BASE_PATH + "/auth";
    public static final String LOGIN_PATH = AUTH_BASE_PATH + "/login";
    public static final String EMPLOYER_REGISTER_PATH = AUTH_BASE_PATH + "/employers/register";
    public static final String STUDENT_REGISTER_PATH = AUTH_BASE_PATH + "/students/register";

    public static final String EMPLOYER_BASE_PATH = API_BASE_PATH + "/employer";
    public static final String INTERNSHIP_OFFERS_PATH = EMPLOYER_BASE_PATH + "/internship-offers";
    public static final String STUDENTS_BY_INTERNSHIP_OFFER_PATH = EMPLOYER_BASE_PATH + "/internship-offer/students";
    public static final String STUDENT_APPLICATION_DETAILS_PATH = EMPLOYER_BASE_PATH + "/internship-offer/student/application";

    public static final String STUDENT_BASE_PATH = API_BASE_PATH + "/student";
    public static final String STUDENT_CV_PATH = STUDENT_BASE_PATH + "/cv";
    public static final String STUDENT_APPLY_INTERNSHIP_PATH = STUDENT_BASE_PATH + "/apply-internship";
  
    public static final String INTERNSHIP_MANAGER_BASE_PATH = API_BASE_PATH + "/internship-manager";
    public static final String SEARCH_INTERNSHIPS_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/search";
    public static final String INTERNSHIP_VALIDATION_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/validation";
    public static final String SEARCH_STUDENTS_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/students/cvs";
    public static final String INTERNSHIP_MANAGER_STUDENT_CV_PATH = INTERNSHIP_MANAGER_BASE_PATH + "/students/{studentId}/cv";
    public static final String INTERNSHIP_MANAGER_STUDENT_CV_DOWNLOAD_PATH = INTERNSHIP_MANAGER_STUDENT_CV_PATH + "/download";
    public static final String INTERNSHIP_MANAGER_STUDENT_CV_VALIDATE_PATH = INTERNSHIP_MANAGER_STUDENT_CV_PATH + "/validate";


}
