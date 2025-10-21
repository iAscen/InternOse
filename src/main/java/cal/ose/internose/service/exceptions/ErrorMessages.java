package cal.ose.internose.service.exceptions;

import lombok.Getter;

@Getter
public enum ErrorMessages {
    PASSWORD_TOO_SHORT("Le mot de passe doit contenir au moins 8 caractères."),
    PASSWORD_MISSING_UPPER_CASE_LETTER("Le mot de passe doit contenir au moins une lettre majuscule."),
    PASSWORD_MISSING_NUMBER("Le mot de passe doit contenir au moins une chiffre."),
    PASSWORD_MISSING_SPECIAL_CHARACTER("Le mot de passe doit contenir au moins un caractère spécial."),
    EMAIL_ALREADY_USED("Un utilisateur avec le courriel %s existe déjà."),
    REQUIRED_FIELDS_MISSING("Veuillez remplir tous les champs obligatoires."),
    INTERNSHIP_OFFER_NOT_FOUND("L'offre de stage avec l'identifiant %d n'a pas été trouvée");

    private final String message;

    ErrorMessages(String message) {
        this.message = message;
    }
}
