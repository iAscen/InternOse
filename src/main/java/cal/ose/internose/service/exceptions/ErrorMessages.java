package cal.ose.internose.service.exceptions;

import lombok.Getter;

@Getter
public enum ErrorMessages {
    PASSWORD_TOO_SHORT("Le mot de passe doit contenir au moins 8 caractères."),
    PASSWORD_MISSING_UPPER("Le mot de passe doit contenir au moins une lettre majuscule."),
    PASSWORD_MISSING_NUMBER("Le mot de passe doit contenir au moins un chiffre."),
    PASSWORD_MISSING_SPECIAL("Le mot de passe doit contenir au moins un caractère spécial."),
    EMAIL_ALREADY_EXISTS("L'utilisateur avec l'email %s existe deja."),
    REQUIRED_FIELDS_MISSING("Il y a des champs manquants.");

    private final String message;

    ErrorMessages(String message) {
        this.message = message;
    }
}
