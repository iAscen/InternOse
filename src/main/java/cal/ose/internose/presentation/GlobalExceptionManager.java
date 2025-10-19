package cal.ose.internose.presentation;

import cal.ose.internose.security.exceptions.AuthenticationException;
import cal.ose.internose.service.DTOs.ErrorResponseDTO;
import cal.ose.internose.service.exceptions.RequiredFieldException;
import cal.ose.internose.service.exceptions.UserAlreadyExistsException;
import cal.ose.internose.service.exceptions.WeakPasswordException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionManager {
    @ExceptionHandler({Exception.class})
    public ResponseEntity<ErrorResponseDTO> handleException(Exception e) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler({UserAlreadyExistsException.class})
    public ResponseEntity<ErrorResponseDTO> handleUserAlreadyExistsException(UserAlreadyExistsException e) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler({RequiredFieldException.class})
    public ResponseEntity<ErrorResponseDTO> handleRequiredFieldException(RequiredFieldException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler({WeakPasswordException.class})
    public ResponseEntity<ErrorResponseDTO> handleWeakPasswordException(WeakPasswordException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponseDTO(e.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity
            .status(e.getStatus())
            .body(new ErrorResponseDTO(e.getMessage()));
    }
}
