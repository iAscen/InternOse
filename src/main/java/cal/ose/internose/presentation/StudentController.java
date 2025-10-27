package cal.ose.internose.presentation;

import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentApplicationDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(Paths.STUDENT_BASE_PATH)
@CrossOrigin("http://localhost:5173")
@AllArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private final ObjectMapper objectMapper;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping(Paths.STUDENT_RESUME_STATUS_RELATIVE)
    public ResponseEntity<String> getResumeStatus(@RequestParam Long studentID) {
        try {
            StudentDTO studentDTO = studentService.getStudentByID(studentID);
            return getResponseEntity(
                HttpStatus.OK, objectMapper.writeValueAsString(studentDTO.getResumeVerificationStatus())
            );
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @PostMapping(Paths.STUDENT_RESUME_RELATIVE)
    public ResponseEntity<String> uploadResume(@RequestParam Long studentID, @RequestParam MultipartFile resumeFile) {
        try {
            studentService.uploadResume(studentID, resumeFile);
            return getResponseEntity(
                HttpStatus.CREATED, "{ \"message\": \"Votre CV a été téléversé avec succès\" }"
            );
        } catch (IOException e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @PostMapping(Paths.STUDENT_APPLY_TO_INTERNSHIP_RELATIVE)
    public ResponseEntity<String> applyToInternshipOffer(@RequestParam Long studentID, @RequestParam Long internshipOfferID) {
        try {
            studentService.applyToInternshipOffer(studentID, internshipOfferID);
            return getResponseEntity(
                HttpStatus.CREATED, "{ \"message\": \"Vous avez postulé à cette offre de stage avec succès\" }"
            );
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @GetMapping(Paths.STUDENT_INTERNSHIP_OFFERS_RELATIVE)
    public ResponseEntity<String> browseInternshipOffers(@RequestParam Long studentID) {
        try {
            List<InternshipOfferDTO> approvedInternshipOfferDTOs = studentService.getAllApprovedInternshipOffers(studentID);
            return getResponseEntity(
                HttpStatus.OK, objectMapper.writeValueAsString(approvedInternshipOfferDTOs)
            );
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @GetMapping(Paths.STUDENT_INTERNSHIP_OFFER_DETAILS_RELATIVE)
    public ResponseEntity<String> getInternshipOfferDetails(@PathVariable Long internshipOfferID) {
        try {
            InternshipOfferDTO internshipOfferDTO = studentService.getInternshipOfferByID(internshipOfferID);
            return getResponseEntity(
                HttpStatus.OK, objectMapper.writeValueAsString(internshipOfferDTO)
            );
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @GetMapping(Paths.STUDENT_APPLICATIONS_RELATIVE)
    public ResponseEntity<String> getStudentApplications(HttpServletRequest httpServletRequest) {
        try {
            String token = httpServletRequest.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer")) {
                token = token.substring(7);
                Long studentID = jwtTokenProvider.getIDFromJWT(token);
                List< StudentApplicationDTO> studentApplicationDTOs = studentService.getStudentApplications(studentID);
                return getResponseEntity(HttpStatus.OK,  objectMapper.writeValueAsString(studentApplicationDTOs));
            } else {
                return getResponseEntity(HttpStatus.UNAUTHORIZED, "{ \"message\": \"Token d'authentification manquant ou incorrect\" }");
            }
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, String body) {
        return ResponseEntity.status(status).body(body);
    }
}
