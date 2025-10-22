package cal.ose.internose.presentation;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.security.Paths;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
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
    public ResponseEntity<List<InternshipOfferDTO>> listInternshipOffers(@RequestParam Long employerID) throws ResourceNotFoundException {
        return getResponseEntity(HttpStatus.OK, employerService.listInternshipOffers(employerID));
    }

    @PostMapping("/internship-offers")
    public ResponseEntity<String> createInternshipOffer(@RequestParam Long employerID, @RequestBody String requestBody) throws ResourceNotFoundException {
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

    @GetMapping("/internship-offers/applications")
    public ResponseEntity<List<StudentDTO>> getStudentApplications(
        @RequestParam("internshipOfferID") Long internshipOfferID,
        @RequestParam(required = false) String resumeVerificationStatus,
        @RequestParam(required = false) String institution,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String sortBy
    ) throws ResourceNotFoundException {
        List<StudentDTO> students = employerService.findApplicationsBy(
            internshipOfferID, 
            resumeVerificationStatus != null ? VerificationStatus.valueOf(resumeVerificationStatus) : null, 
            institution, 
            program, 
            sortBy
        );
        return ResponseEntity.ok(students);
    }

    @GetMapping("/internship-offers/applications/{studentID}")
    public ResponseEntity<StudentDTO> getStudentApplicationDetails(
        @RequestParam("internshipOfferID") Long internshipOfferID,
        @PathVariable Long studentID
    ) throws ResourceNotFoundException {
        StudentDTO application = employerService.getApplicationDetails(internshipOfferID, studentID);
        return ResponseEntity.ok(application);
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
