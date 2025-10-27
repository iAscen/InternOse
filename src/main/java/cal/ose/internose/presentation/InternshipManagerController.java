package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping(Paths.INTERNSHIP_MANAGER_BASE_PATH)
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class InternshipManagerController {
    private final InternshipManagerService internshipManagerService;
    private final StudentService studentService;
    private final ObjectMapper objectMapper;

    @GetMapping(Paths.INTERNSHIP_MANAGER_OFFERS_RELATIVE)
    public ResponseEntity<String> findInternshipOffersBy(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String isVerified,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String title
    ) {
        Boolean isVerifiedBoolean = null;
        if (isVerified != null && !isVerified.equals("null") && !isVerified.isEmpty())
            isVerifiedBoolean = Boolean.parseBoolean(isVerified);

        try {
            List<InternshipOfferDTO> internshipOfferDTOs = internshipManagerService.findInternshipsBy(
                isVerifiedBoolean, program, title, sortBy
            );

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(internshipOfferDTOs));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_SEARCH_RELATIVE)
    public ResponseEntity<String> browseInternshipOffers(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String isVerified,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String title
    ) {
        Boolean isVerifiedBoolean = null;
        if (isVerified != null) isVerifiedBoolean = Boolean.parseBoolean(isVerified);

        try {
            List<InternshipOfferDTO> internshipOfferDTOs =
                internshipManagerService.findInternshipsBy(isVerifiedBoolean, program, title, sortBy);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(internshipOfferDTOs));
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_RELATIVE)
    public ResponseEntity<String> verifyInternshipOffer(
        @RequestParam Long internshipOfferID,
        @RequestParam Boolean isApproved,
        @RequestParam(required = false) String comment
    ) {
        try {
            InternshipOfferDTO verifiedInternshipOffer =
                internshipManagerService.verifyInternshipOffer(internshipOfferID, isApproved, comment);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(verifiedInternshipOffer));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.OK, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_STUDENTS_CVS_RELATIVE)
    public ResponseEntity<String> getAllStudentsResumes(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String sortOrder,
        @RequestParam(required = false) String status
    ) {
        if (sortBy != null && sortBy.trim().isEmpty()) sortBy = null;
        if (sortOrder != null && sortOrder.trim().isEmpty()) sortOrder = null; // Utiliser l'ordre par défaut (ascendant)

        try {
            List<StudentDTO> studentDTOs = studentService.getAllStudentsWithResumes(sortBy, sortOrder, status);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(studentDTOs));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_RESUME_RELATIVE)
    public ResponseEntity<String> getStudentResumeDetails(@PathVariable Long studentID) {
        try {
            StudentDTO studentDTO = studentService.getStudentByID(studentID);
            List<String> studentResumeDetails = getStudentResumeDetails(studentDTO);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(studentResumeDetails));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_DOWNLOAD_RESUME_RELATIVE)
    public ResponseEntity<String> downloadStudentResume(@PathVariable Long studentID) {
        try {
            StudentDTO studentDTO = studentService.getStudentByID(studentID);
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            httpHeaders.setContentDispositionFormData("attachment", studentDTO.getResumeFileName());
            httpHeaders.setContentLength(studentDTO.getResumeFileData().length);

            return getResponseEntity(HttpStatus.OK, httpHeaders, objectMapper.writeValueAsString(studentDTO.getResumeFileData()));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PostMapping(Paths.INTERNSHIP_MANAGER_VERIFY_RESUME_RELATIVE)
    public ResponseEntity<String> verifyStudentResume(
        @PathVariable Long studentID,
        @RequestParam Boolean isApproved,
        @RequestParam(required = false) String rejectionReason
    ) {
        try {
            StudentDTO studentWithVerifiedResume =
                internshipManagerService.verifyResume(studentID, isApproved, rejectionReason);
            List<String> verifiedStudentResumeDetails = getStudentResumeDetails(studentWithVerifiedResume);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(verifiedStudentResumeDetails));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    private List<String> getStudentResumeDetails(StudentDTO studentDTO) {
        return List.of(
            studentDTO.getResumeVerificationStatus().toString(),
            studentDTO.getResumeUploadDate().toString(),
            studentDTO.getResumeFileName(),
            studentDTO.getResumeFileType(),
            Base64.getEncoder().encodeToString(studentDTO.getResumeFileData()), // Convertir byte[] en String correctement
            studentDTO.getResumeVerifiedDate().toString(),
            studentDTO.getResumeRejectionReason()
        );
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, String body) {
        return ResponseEntity.status(status).body(body);
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, HttpHeaders headers, String body) {
        return ResponseEntity.status(status).headers(headers).body(body);
    }
}
