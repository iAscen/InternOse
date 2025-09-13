package cal.ose.internose.controleur;

import cal.ose.internose.service.dto.ErreurReponseDTO;
import cal.ose.internose.service.exception.ChampObligatoireException;
import cal.ose.internose.service.exception.EmailDejaExistantException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GestionnaireGlobalException {

    @ExceptionHandler({Exception.class})
    public ResponseEntity<ErreurReponseDTO> gestionExceptionGenerale() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErreurReponseDTO("Erreur interne du serveur"));
    }

    @ExceptionHandler({
            EmailDejaExistantException.class
    })
    public ResponseEntity<ErreurReponseDTO> gestionEmailDejaExistant(Exception e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErreurReponseDTO(e.getMessage()));
    }
    
    @ExceptionHandler({
            ChampObligatoireException.class
    })
    public ResponseEntity<ErreurReponseDTO> gestionChampObligatoire(Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErreurReponseDTO(e.getMessage()));
    }
}
