package cal.ose.internose.security.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends APIException {
    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
