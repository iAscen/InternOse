package cal.ose.internose.presentation;

import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.EmployerService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employer")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployerController {
    private final EmployerService employerService;
    private final ObjectMapper objectMapper;

    public EmployerController(EmployerService employerService, ObjectMapper objectMapper) {
        this.employerService = employerService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/internship-offers")
    public ResponseEntity<List<InternshipOfferDTO>> listInternshipOffers(@RequestParam Long employerID) {
        return getResponseEntity(HttpStatus.OK, employerService.listInternshipOffers(employerID));
    }

    @PostMapping("/internship-offers")
    public ResponseEntity<String> createInternshipOffer(@RequestParam Long employerID, @RequestBody String requestBody) {
        InternshipOfferDTO internshipOfferDTO;
        try {
            internshipOfferDTO = objectMapper.readValue(requestBody, InternshipOfferDTO.class);
            employerService.createInternshipOffer(employerID, internshipOfferDTO);
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
