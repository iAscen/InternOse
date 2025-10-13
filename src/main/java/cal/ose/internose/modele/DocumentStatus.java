package cal.ose.internose.modele;

public enum DocumentStatus {
    NONE,        // Aucun CV téléversé
    PENDING,     // CV en attente de validation
    APPROVED,    // CV approuvé
    REJECTED;     // CV rejeté

    public static DocumentStatus of(String status) {
        if (status == null) return null;
        return switch (status.toUpperCase()) {
            case "PENDING" -> PENDING;
            case "APPROVED" -> APPROVED;
            case "REJECTED" -> REJECTED;
            default -> NONE;
        };
    }
}
