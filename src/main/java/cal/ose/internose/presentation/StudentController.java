package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.StudentService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(Paths.STUDENT_BASE_PATH)
@CrossOrigin("http://localhost:5173")
@AllArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @GetMapping(Paths.STUDENT_RESUME_STATUS_PATH)
    public ResponseEntity<Map<String, Object>> getCVStatus(@RequestParam("studentID") Long studentID) {
        try {
            StudentDTO student = studentService.getStudentByID(studentID);

            if (student == null)
                return getResponseEntity(HttpStatus.NOT_FOUND, Map.of("error", "Étudiant non trouvé"));

            Map<String, Object> response = new HashMap<>();
            response.put("resumeFileName", student.getResumeFileName() != null
                ? student.getResumeFileName()
                : "");
            response.put("upload_date", student.getResumeUploadDate() != null
                ? student.getResumeUploadDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : "");
            response.put("verificationStatus", student.getResumeVerificationStatus().name().toLowerCase());
            response.put("verifyDate", student.getResumeVerifiedDate() != null
                ? student.getResumeVerifiedDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : "");
            response.put("rejectionReason", student.getResumeRejectionReason() != null
                ? student.getResumeRejectionReason()
                : "");

            return getResponseEntity(HttpStatus.OK, response);
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.INTERNAL_SERVER_ERROR,
                Map.of("error", "Erreur lors de la récupération du statut du CV")
            );
        }
    }

    @PostMapping(Paths.STUDENT_RESUME_PATH)
    public ResponseEntity<String> uploadCV(@RequestParam("studentID") Long studentID, @RequestParam("file") MultipartFile CVFile) {
        try {
            studentService.uploadResume(studentID, CVFile);
            return getResponseEntity(
                HttpStatus.CREATED, "{ \"message\": \"Votre CV a été téléversé avec succès\" }"
            );
        } catch (IOException e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
