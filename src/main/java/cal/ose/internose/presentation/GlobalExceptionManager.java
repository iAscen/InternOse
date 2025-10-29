package cal.ose.internose.presentation;

import cal.ose.internose.security.exceptions.AuthenticationException;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.exceptions.RequiredFieldException;
import cal.ose.internose.service.exceptions.UserAlreadyExistsException;
import cal.ose.internose.service.exceptions.WeakPasswordException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionManager {
    /*@ExceptionHandler({Exception.class})
    public ResponseEntity<String> handleException(Exception e) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(e.getMessage());
    }*/

    @ExceptionHandler({UserAlreadyExistsException.class})
    public ResponseEntity<String> handleUserAlreadyExistsException(UserAlreadyExistsException e) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(e.getMessage());
    }

    @ExceptionHandler({RequiredFieldException.class})
    public ResponseEntity<String> handleRequiredFieldException(RequiredFieldException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(e.getMessage());
    }

    @ExceptionHandler({WeakPasswordException.class})
    public ResponseEntity<String> handleWeakPasswordException(WeakPasswordException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(e.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(e.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFoundException(ResourceNotFoundException e) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(e.getMessage());
    }
}
