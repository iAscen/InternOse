package cal.ose.internose.service.exception;

public class EmailDejaExistantException extends RuntimeException {
    public EmailDejaExistantException(String message) {
        super(message);
    }
}
