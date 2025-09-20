package cal.ose.internose.service.exception;

public class RequiredFieldException extends RuntimeException {
    public RequiredFieldException(String message) {
        super(message);
    }
}
