package cal.ose.internose.presentation;

import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InterviewDTO;
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

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFERS_RELATIVE)
    public ResponseEntity<List<InternshipOfferDTO>> listInternshipOffers(@RequestParam Long employerID) {
        return getResponseEntity(HttpStatus.OK, employerService.listInternshipOffers(employerID));
    }

    @PostMapping(Paths.EMPLOYER_INTERNSHIP_OFFERS_RELATIVE)
    public ResponseEntity<?> createInternshipOffer(@RequestParam Long employerID, @RequestBody String requestBody) {
        try {
            InternshipOfferDTO internshipOfferDTO = objectMapper.readValue(requestBody, InternshipOfferDTO.class);
            InternshipOfferDTO createdInternshipOffer = employerService.createInternshipOffer(employerID, internshipOfferDTO);
            return getResponseEntity(HttpStatus.CREATED, createdInternshipOffer);
        } catch (JsonProcessingException e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFER_APPLICATIONS_RELATIVE)
    public ResponseEntity<List<StudentDTO>> getStudentApplications(
        @RequestParam("internshipOfferID") Long internshipOfferID,
        @RequestParam(required = false) String applicationStatus,
        @RequestParam(required = false) String institution,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String sortBy
    ) {
        List<StudentDTO> students = employerService.getStudentApplications(
            internshipOfferID,
            applicationStatus != null ? StudentApplication.ApplicationStatus.valueOf(applicationStatus) : null,
            institution,
            program,
            sortBy
        );
        return getResponseEntity(HttpStatus.OK, students);
    }

    @GetMapping(Paths.EMPLOYER_INTERNSHIP_OFFER_APPLICATION_DETAILS_RELATIVE)
    public ResponseEntity<StudentDTO> getStudentApplicationDetails(
        @RequestParam("internshipOfferID") Long internshipOfferID,
        @PathVariable Long studentID
    ) {
        StudentDTO studentApplicationDetails = employerService.getStudentApplicationDetails(internshipOfferID, studentID);
        return getResponseEntity(HttpStatus.OK, studentApplicationDetails);
    }

    @PostMapping(Paths.EMPLOYER_SCHEDULE_INTERVIEW_RELATIVE)
    public ResponseEntity<?> scheduleInterview(
        @RequestParam("internshipOfferID") Long internshipOfferID,
        @RequestParam("studentID") Long studentID,
        @RequestBody String requestBody
    ) {
        try {
            InterviewDTO interviewDTO = objectMapper.readValue(requestBody, InterviewDTO.class);
            InterviewDTO scheduledInterview = employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO);
            return getResponseEntity(HttpStatus.CREATED, scheduledInterview);
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping(Paths.EMPLOYER_INTERVIEWS_RELATIVE)
    public ResponseEntity<?> getScheduledInterviews(@RequestParam("employerID") Long employerID) {
        try {
            List<InterviewDTO> scheduledInterviews = employerService.getInterviewsByEmployer(employerID);
            return getResponseEntity(HttpStatus.OK, scheduledInterviews);
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.OK, e.getMessage());
        }
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
