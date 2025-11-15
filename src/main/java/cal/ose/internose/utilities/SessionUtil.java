package cal.ose.internose.utilities;

import java.time.LocalDate;

public class SessionUtil {
    public static final int WINTER_SESSION_START_MONTH = 1;
    public static final int WINTER_SESSION_START_DAY = 23;

    public static final int AUTUMN_SESSION_START_MONTH = 6;
    public static final int AUTUMN_SESSION_START_DAY = 25;

    public static String getCurrentSession() {
        LocalDate now = LocalDate.now();
        int day = now.getDayOfMonth();
        int month = now.getMonthValue();
        int year = now.getYear();

        if (month == WINTER_SESSION_START_MONTH && day < WINTER_SESSION_START_DAY) {
            return "Autumn-" + (year - 1);
        }

        boolean beforeAutumnStart = month < AUTUMN_SESSION_START_MONTH
            || (month == AUTUMN_SESSION_START_MONTH && day < AUTUMN_SESSION_START_DAY);

        if (beforeAutumnStart) {
            return "Winter-" + year;
        }

        return "Autumn-" + year;
    }
}
