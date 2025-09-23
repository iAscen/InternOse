package cal.ose.internose.security;

public class Paths {
    public static final String API_BASE_PATH = "/api";

    public static final String AUTH_BASE_PATH = API_BASE_PATH + "/auth";
    public static final String LOGIN_PATH = AUTH_BASE_PATH + "/login";
    public static final String EMPLOYER_REGISTER_PATH = AUTH_BASE_PATH + "/employers/register";
    public static final String STUDENT_REGISTER_PATH = AUTH_BASE_PATH + "/students/register";

    public static final String EMPLOYER_BASE_PATH = API_BASE_PATH + "/employer";
    public static final String INTERNSHIP_OFFERS_PATH = EMPLOYER_BASE_PATH + "/internship-offers";
}
