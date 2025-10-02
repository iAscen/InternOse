package cal.ose.internose.presentation;

import cal.ose.internose.modele.Student;
import cal.ose.internose.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin("http://localhost:5173")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/cv")
    public ResponseEntity<String> uploadCV(@RequestParam("studentID") Long studentID, @RequestParam("file") MultipartFile CVFile) {
        try {
            studentService.uploadCV(studentID, CVFile);
            return getResponseEntity(
                HttpStatus.CREATED, "{ \"message\": \"Votre CV a été téléversé avec succès\" }"
            );
        } catch (IOException e) {
            return getResponseEntity(
                HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }"
            );
        }
    }

    @GetMapping("/cv/status")
    public ResponseEntity<Map<String, Object>> getCVStatus(@RequestParam("studentID") Long studentID) {
        try {
            Student student = studentService.getStudentById(studentID).orElse(null);
            
            if (student == null) {
                return getResponseEntity(
                    HttpStatus.NOT_FOUND, 
                    Map.of("error", "Étudiant non trouvé")
                );
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", student.getCvStatus().name().toLowerCase());
            response.put("fileName", student.getCVFileName() != null ? student.getCVFileName() : "");
            response.put("uploadedAt", student.getCvUploadedAt() != null ? 
                student.getCvUploadedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "");
            response.put("validatedAt", student.getCvValidatedAt() != null ? 
                student.getCvValidatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "");
            response.put("rejectionReason", student.getCvRejectionReason() != null ? 
                student.getCvRejectionReason() : "");

            return getResponseEntity(HttpStatus.OK, response);
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                Map.of("error", "Erreur lors de la récupération du statut du CV")
            );
        }
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
