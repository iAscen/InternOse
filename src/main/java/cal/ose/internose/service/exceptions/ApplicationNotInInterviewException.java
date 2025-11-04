package cal.ose.internose.service.exceptions;

public class ApplicationNotInInterviewException extends RuntimeException {
    public ApplicationNotInInterviewException() {
        super("L'application n'est pas en attente d'interview");
    }
}
