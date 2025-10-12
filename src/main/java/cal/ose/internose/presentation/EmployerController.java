package cal.ose.internose.presentation;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.EmployerService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class EmployerController {
    private final EmployerService employerService;
    private final ObjectMapper objectMapper;

    public EmployerController(EmployerService employerService, ObjectMapper objectMapper) {
        this.employerService = employerService;
        this.objectMapper = objectMapper;
    }

    @GetMapping(Paths.INTERNSHIP_OFFERS_PATH)
    public ResponseEntity<List<InternshipOfferDTO>> listInternshipOffers(@RequestParam Long employerID) {
        return getResponseEntity(HttpStatus.OK, employerService.listInternshipOffers(employerID));
    }

    @PostMapping(Paths.INTERNSHIP_OFFERS_PATH)
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

    @GetMapping(Paths.STUDENTS_BY_INTERNSHIP_OFFER_PATH)
    public ResponseEntity<List<StudentDTO>> findStudentsBy(@RequestParam() long employerId,
                                                           @RequestParam(required = false) String cvStatus,
                                                           @RequestParam(required = false) String program,
                                                           @RequestParam(required = false) String institution,
                                                           @RequestParam(required = false) String sortBy) {

        DocumentStatus status = DocumentStatus.of(cvStatus);
        List<StudentDTO> students = employerService.findStudentsBy(employerId, status, program, institution, sortBy);

        return ResponseEntity.ok(students);
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
