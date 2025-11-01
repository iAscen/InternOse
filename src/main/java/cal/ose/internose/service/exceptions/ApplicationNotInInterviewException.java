package cal.ose.internose.service.exceptions;

public class ApplicationNotInInterviewException extends RuntimeException {
    public ApplicationNotInInterviewException() {
        super("Cette application n'a pas eu d'interview en cours.");
    }
}
