package cal.ose.internose.presentation;

import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.*;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.exceptions.ForbiddenException;
import cal.ose.internose.service.exceptions.InterviewAlreadyScheduledException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

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

    @GetMapping(Paths.EMPLOYER_PAST_SESSIONS_INTERNSHIP_OFFERS_PATH)
    public ResponseEntity<String> listPastSessionsInternshipOffers(@RequestParam Long employerID) {
        try {
            return getResponseEntity(
                HttpStatus.OK, objectMapper.writeValueAsString(employerService.listPastSessionsInternshipOffers(employerID))
            );
        } catch (JsonProcessingException e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        } catch (NoSuchElementException e) {
            return getResponseEntity(
                HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }"
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
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
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
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PutMapping(Paths.EMPLOYER_INTERNSHIP_OFFER_STUDENT_APPLICATION_STATUS_PATH)
    public ResponseEntity<String> reviewApplication(
        @PathVariable Long internshipOfferID,
        @PathVariable Long studentID,
        @RequestParam Boolean isApproved,
        @RequestParam(required = false) String comment
    ) {
        try {
            StudentApplicationDTO reviewedApplication =
                employerService.reviewApplication(internshipOfferID, studentID, isApproved, comment);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(reviewedApplication));

        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.EMPLOYER_APPLICATIONS_COUNT_UNSEEN_PATH)
    public ResponseEntity<String> getApplicationsCountUnseen(@PathVariable long offerID) {
        try {
            Map<String, Integer> unseenApplications = employerService.countUnseenApplications(offerID);

            String json = String.format(
                "{\"studentsWhoRejectedTheOffer\": %d, \"studentsWhoAcceptedTheOffer\": %d}",
                unseenApplications.getOrDefault("studentsWhoRejectedTheOffer", 0),
                unseenApplications.getOrDefault("studentsWhoAcceptedTheOffer", 0)
            );

            return ResponseEntity.ok(json);
        } catch (NoSuchElementException e) {
            String errorJson = String.format("{\"message\": \"%s\"}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorJson);
        }
    }

    @PutMapping(Paths.EMPLOYER_APPLICATIONS_MAKE_SEEN)
    private ResponseEntity<String> makeApplicationsSeen(@PathVariable long offerID) {
        try {
            employerService.makeApplicationsSeen(offerID);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            String errorJson = String.format("{\"message\": \"%s\"}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorJson);
        }
    }

    @GetMapping(Paths.EMPLOYER_CONTRACT_PATH)
    public ResponseEntity<String> getInternshipContract(
        @RequestParam Long employerID,
        @RequestParam Long internshipOfferID,
        @PathVariable Long studentID
    ) {
        try {
            InternshipContractDTO contract = employerService.findContractByEmployerAndOffer(employerID, internshipOfferID, studentID);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(contract));
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PostMapping(Paths.EMPLOYER_SIGN_CONTRACT_PATH)
    public ResponseEntity<String> signInternshipContract(
        @RequestParam Long employerID,
        @RequestParam Long internshipOfferID,
        @PathVariable Long studentID
    ) {
        try {
            InternshipContractDTO signedContract = employerService.signContract(studentID, internshipOfferID, employerID);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(signedContract));
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (IllegalStateException e) {
            return getResponseEntity(HttpStatus.CONFLICT, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.EMPLOYER_INTERN_ASSESSMENT_PATH)
    public ResponseEntity<String> getInternAssessment(
        @RequestParam Long employerID, @RequestParam Long internshipContractID
    ) {
        try {
            InternAssessmentDTO internAssessmentDTO = employerService.findInternAssessment(employerID, internshipContractID);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(internAssessmentDTO));
        } catch (ForbiddenException e) {
            return getResponseEntity(HttpStatus.FORBIDDEN, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PostMapping(Paths.EMPLOYER_INTERN_ASSESSMENT_PATH)
    public ResponseEntity<String> postInternAssessment(
        @RequestParam Long employerID, @RequestParam Long internshipContractID, @RequestBody String requestBody
    ) {
        try {
            InternAssessmentDTO internAssessmentDTO = objectMapper.readValue(requestBody, InternAssessmentDTO.class);
            InternAssessmentDTO savedInternAssessmentDTO = employerService.saveInternAssessment(employerID, internshipContractID, internAssessmentDTO);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(savedInternAssessmentDTO));
        } catch (ForbiddenException e) {
            return getResponseEntity(HttpStatus.FORBIDDEN, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, String body) {
        return ResponseEntity.status(status).body(body);
    }
}
