package cal.ose.internose.utilities;

import java.time.LocalDate;

public class SessionUtil {
    public static final int WINTER_SESSION_TRANSITION_MONTH = 5; // Mai
    public static final int WINTER_SESSION_TRANSITION_DAY = 1; // 1er mai

    /**
     * Génère la session actuelle (Winter-YYYY)
     * Si on est à partir du 1er mai, la session devient Hiver de l'année suivante
     * Exemple : 1er mai 2025 -> Winter-2026, mais mars 2025 -> Winter-2025
     */
    public static String getCurrentSession() {
        return getSessionForDate(LocalDate.now());
    }

    /**
     * Génère la session pour une date donnée (Winter-YYYY)
     * Si la date est à partir du 1er mai, la session devient Hiver de l'année suivante
     * Exemple : 1er mai 2025 -> Winter-2026, mais mars 2025 -> Winter-2025
     */
    public static String getSessionForDate(LocalDate date) {
        int day = date.getDayOfMonth();
        int month = date.getMonthValue();
        int year = date.getYear();

        // Si on est à partir du 1er mai (mois >= 5 et jour >= 1), on est dans la session de l'année suivante
        if (month > WINTER_SESSION_TRANSITION_MONTH || 
            (month == WINTER_SESSION_TRANSITION_MONTH && day >= WINTER_SESSION_TRANSITION_DAY)) {
            return "Winter-" + (year + 1);
        }

        // Avant le 1er mai, on est dans la session de l'année en cours
        return "Winter-" + year;
    }
}
