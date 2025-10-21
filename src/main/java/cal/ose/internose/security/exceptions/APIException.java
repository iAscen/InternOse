package cal.ose.internose.security.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public abstract class APIException extends Exception {
    protected final HttpStatus status;
    protected final String message;

    @Override
    public String getMessage() {
        return message;
    }
}
