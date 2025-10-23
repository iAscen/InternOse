package cal.ose.internose.presentation;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.security.Paths;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InterviewDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.exceptions.AlreadyExistsException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(Paths.EMPLOYER_BASE_PATH)
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class EmployerController {
    private final EmployerService employerService;
    private final ObjectMapper objectMapper;

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFERS_RELATIVE)
    public ResponseEntity<List<InternshipOfferDTO>> listInternshipOffers(@RequestParam Long employerID)
            throws ResourceNotFoundException {
        return getResponseEntity(HttpStatus.OK, employerService.listInternshipOffers(employerID));
    }

    @PostMapping(Paths.EMPLOYER_INTERNSHIP_OFFERS_RELATIVE)
    public ResponseEntity<String> createInternshipOffer(@RequestParam Long employerID, @RequestBody String requestBody)
            throws ResourceNotFoundException {
        InternshipOfferDTO internshipOfferDTO;
        try {
            internshipOfferDTO = objectMapper.readValue(requestBody, InternshipOfferDTO.class);
            employerService.createInternshipOffer(employerID, internshipOfferDTO);
            return getResponseEntity(
                    HttpStatus.CREATED, "{ \"message\": \"Nouvelle offre de stage créée avec succès\"}");
        } catch (JsonProcessingException e) {
            return getResponseEntity(
                    HttpStatus.BAD_REQUEST, "{ \"message\": \"La structure JSON fournie est incorrecte\" }");
        }
    }

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_RELATIVE)
    public ResponseEntity<List<StudentDTO>> getStudentApplications(
            @RequestParam("internshipOfferID") Long internshipOfferID,
            @RequestParam(required = false) String resumeVerificationStatus,
            @RequestParam(required = false) String institution,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String sortBy) throws ResourceNotFoundException {
        List<StudentDTO> students = employerService.findApplicationsBy(
                internshipOfferID,
                resumeVerificationStatus != null ? VerificationStatus.valueOf(resumeVerificationStatus) : null,
                institution,
                program,
                sortBy);
        return ResponseEntity.ok(students);
    }

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFER_APPLICATION_DETAILS_RELATIVE)
    public ResponseEntity<StudentDTO> getStudentApplicationDetails(
            @RequestParam("internshipOfferID") Long internshipOfferID,
            @PathVariable Long studentID) throws ResourceNotFoundException {
        StudentDTO application = employerService.getApplicationDetails(internshipOfferID, studentID);
        return ResponseEntity.ok(application);
    }

    @PostMapping(Paths.EMPLOYER_SCHEDULE_INTERVIEW_RELATIVE)
    public ResponseEntity<Map<String, Object>> scheduleInterview(
            @RequestParam("internshipOfferID") Long internshipOfferID,
            @RequestParam("studentID") Long studentID,
            @RequestBody String requestBody) {
        try {
            InterviewDTO interviewDTO = objectMapper.readValue(requestBody, InterviewDTO.class);
            InterviewDTO createdInterview = employerService.scheduleInterview(internshipOfferID, studentID,
                    interviewDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Convocation envoyée avec succès");
            response.put("interview", createdInterview);

            return getResponseEntity(HttpStatus.CREATED, response);
        } catch (ResourceNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.NOT_FOUND, errorResponse);
        } catch (AlreadyExistsException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.CONFLICT, errorResponse);
        } catch (JsonProcessingException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "La structure JSON fournie est incorrecte");
            return getResponseEntity(HttpStatus.BAD_REQUEST, errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la création de la convocation");
            return getResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, errorResponse);
        }
    }

    @GetMapping(Paths.EMPLOYER_INTERVIEWS_RELATIVE)
    public ResponseEntity<Map<String, Object>> getEmployerInterviews(@RequestParam("employerID") Long employerID) {
        try {
            List<InterviewDTO> interviews = employerService.getInterviewsByEmployer(employerID);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("interviews", interviews);
            response.put("count", interviews.size());

            return getResponseEntity(HttpStatus.OK, response);
        } catch (ResourceNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.NOT_FOUND, errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des entrevues");
            return getResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, errorResponse);
        }
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
