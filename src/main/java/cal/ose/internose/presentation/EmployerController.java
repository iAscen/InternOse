package cal.ose.internose.presentation;

import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InterviewDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.exceptions.InterviewAlreadyScheduledException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class EmployerController {
    private final EmployerService employerService;
    private final ObjectMapper objectMapper;

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFERS_PATH)
    public ResponseEntity<String> listInternshipOffers(@RequestParam Long employerID) {
        try {
            return getResponseEntity(
                HttpStatus.OK, objectMapper.writeValueAsString(employerService.listInternshipOffers(employerID))
            );
        } catch (JsonProcessingException e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @PostMapping(Paths.EMPLOYER_INTERNSHIP_OFFERS_PATH)
    public ResponseEntity<String> createInternshipOffer(@RequestParam Long employerID, @RequestBody String requestBody) {
        try {
            InternshipOfferDTO internshipOfferDTO = employerService.createInternshipOffer(
                employerID, objectMapper.readValue(requestBody, InternshipOfferDTO.class)
            );
            return getResponseEntity(HttpStatus.CREATED, objectMapper.writeValueAsString(internshipOfferDTO));
        } catch (JsonProcessingException e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATIONS_PATH)
    public ResponseEntity<String> getStudentApplications(
        @RequestParam("internshipOfferID") Long internshipOfferID,
        @RequestParam(required = false) String applicationStatus,
        @RequestParam(required = false) String institution,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String sortBy
    ) {
        try {
            List<StudentDTO> studentApplications = employerService.getStudentApplications(
                internshipOfferID,
                applicationStatus != null ? StudentApplication.ApplicationStatus.valueOf(applicationStatus) : null,
                institution,
                program,
                sortBy
            );
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(studentApplications));
        } catch (JsonProcessingException e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATION_DETAILS_PATH)
    public ResponseEntity<String> getStudentApplicationDetails(@RequestParam Long internshipOfferID, @PathVariable Long studentID) {
        try {
            StudentDTO studentApplicationDetails = employerService.getStudentApplicationDetails(internshipOfferID, studentID);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(studentApplicationDetails));
        } catch (JsonProcessingException e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PostMapping(Paths.EMPLOYER_INTERVIEWS_PATH)
    public ResponseEntity<String> scheduleInterview(
        @RequestParam Long internshipOfferID,
        @RequestParam Long studentID,
        @RequestBody String requestBody
    ) {
        try {
            InterviewDTO interviewDTO = employerService.scheduleInterview(
                internshipOfferID, studentID, objectMapper.readValue(requestBody, InterviewDTO.class)
            );
            return getResponseEntity(HttpStatus.CREATED, objectMapper.writeValueAsString(interviewDTO));
        } catch (InterviewAlreadyScheduledException e) {
            return getResponseEntity(HttpStatus.CONFLICT, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
        catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.EMPLOYER_INTERVIEWS_PATH)
    public ResponseEntity<String> getScheduledInterviews(@RequestParam Long employerID) {
        try {
            List<InterviewDTO> scheduledInterviews = employerService.getInterviewsByEmployer(employerID);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(scheduledInterviews));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, String body) {
        return ResponseEntity.status(status).body(body);
    }
}
