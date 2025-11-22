package cal.ose.internose.utilities;

import java.time.LocalDate;

public class SessionUtil {
    public static final int WINTER_SESSION_START_MONTH = 1;
    public static final int WINTER_SESSION_START_DAY = 23;

    public static final int WINTER_SESSION_START_MONTH_2 = 6;
    public static final int WINTER_SESSION_START_DAY_2 = 25;

    public static String getCurrentSession() {
        LocalDate now = LocalDate.now();
        int day = now.getDayOfMonth();
        int month = now.getMonthValue();
        int year = now.getYear();

        if (month == WINTER_SESSION_START_MONTH && day < WINTER_SESSION_START_DAY) {
            return "Winter-" + (year - 1);
        }

        boolean beforeWinterStart = month < WINTER_SESSION_START_MONTH_2
            || (month == WINTER_SESSION_START_MONTH_2 && day < WINTER_SESSION_START_DAY_2);

        if (beforeWinterStart) {
            return "Winter-" + year;
        }

        return "Winter-" + year;
    }
}
