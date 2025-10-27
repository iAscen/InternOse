package cal.ose.internose.service.exceptions;

public class InterviewAlreadyScheduledException extends Exception {
    public InterviewAlreadyScheduledException() {
        super("Vous avez déjà postulé.e à cette offre de stage");
    }
}
