package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.EmployerService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(Paths.EMPLOYER_BASE_PATH)
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class EmployerController {
    private final EmployerService employerService;
    private final ObjectMapper objectMapper;

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
