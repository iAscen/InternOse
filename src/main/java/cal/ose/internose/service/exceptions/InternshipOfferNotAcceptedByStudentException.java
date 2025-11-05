package cal.ose.internose.service.exceptions;

public class InternshipOfferNotAcceptedByStudentException extends RuntimeException {
    public InternshipOfferNotAcceptedByStudentException() {
        super("L’étudiant doit d’abord accepter l’offre de stage avant de pouvoir créer le contrat.");
    }
}
