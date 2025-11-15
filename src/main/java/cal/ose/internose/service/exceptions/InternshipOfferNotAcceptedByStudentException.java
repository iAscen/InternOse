package cal.ose.internose.service.exceptions;

public class InternshipOfferNotAcceptedByStudentException extends Exception {
    public InternshipOfferNotAcceptedByStudentException() {
        super("L'étudiant doit d'abord accepter l'offre de stage avant de pouvoir créer l'entente de stage.");
    }
}
