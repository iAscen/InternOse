package cal.ose.internose.presentation;

import cal.ose.internose.service.DTOs.OffreStageDTO;
import cal.ose.internose.service.EmployeurService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employeur")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeurController {
    private final EmployeurService employeurService;
    private final ObjectMapper objectMapper;

    public EmployeurController(EmployeurService employeurService, ObjectMapper objectMapper) {
        this.employeurService = employeurService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/offres-stage")
    public ResponseEntity<List<OffreStageDTO>> listerOffresStage() {
        return getResponseEntity(HttpStatus.OK, employeurService.listerOffresStage());
    }

    @PostMapping("/offres-stage")
    public ResponseEntity<String> creerOffreStage(@RequestBody String requestBody) {
        OffreStageDTO offreStageDTO;
        try {
            offreStageDTO = objectMapper.readValue(requestBody, OffreStageDTO.class);
            employeurService.creerOffreStage(offreStageDTO);
            return getResponseEntity(
                HttpStatus.CREATED, "{ \"message\": \"Nouvelle offre de stage créée avec succès\"}"
            );
        } catch (JsonProcessingException e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"La structure JSON fournie est incorrecte\" }"
            );
        }
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
