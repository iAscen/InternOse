package cal.ose.internose.service.exceptions;

public class SessionMismatchException extends RuntimeException {
    public SessionMismatchException() {
        super("La session de l'offre de stage ne correspond pas à la session actuelle");
    }
}
