package cal.ose.internose.service.exceptions;

public class SessionMismatchException extends RuntimeException {
    public SessionMismatchException(String message) {
        super(message);
    }
}
