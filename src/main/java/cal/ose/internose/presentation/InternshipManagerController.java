package cal.ose.internose.presentation;

import cal.ose.internose.modele.Student;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cal.ose.internose.security.Paths;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipManagerController {
    private InternshipManagerService internshipManagerService;
    private StudentService studentService;

    @GetMapping(Paths.SEARCH_INTERNSHIPS_PATH)
    public ResponseEntity<List<InternshipOfferDTO>> findInternshipsBy(@RequestParam(required = false) String domain,
                                                                      @RequestParam(required = false) Boolean valid,
                                                                      @RequestParam(required = false) String enterprise,
                                                                      @RequestParam(required = false) String sortBy) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(internshipManagerService.findInternshipsBy(domain, valid, enterprise, sortBy));
    }

    @GetMapping(Paths.INTERNSHIP_VALIDATION_PATH)
    public ResponseEntity<String> validateInternshipOffer(@RequestParam Long offerId, @RequestParam Boolean approved, @RequestParam(required = false) String commentaire) {
        internshipManagerService.validateInternshipOffer(offerId, approved, commentaire);

        return ResponseEntity.status(HttpStatus.OK).body(Paths.INTERNSHIP_VALIDATION_PATH);
    }

    @GetMapping("/api/internship-manager/students/cvs")
    public ResponseEntity<List<Map<String, Object>>> getAllStudentCVs() {
        try {
            List<Student> students = studentService.getAllStudentsWithCVs();
            List<Map<String, Object>> response = students.stream()
                    .map(student -> {
                        Map<String, Object> studentData = new HashMap<>();
                        studentData.put("studentId", student.getId());
                        studentData.put("firstName", student.getFirstName());
                        studentData.put("lastName", student.getLastName());
                        studentData.put("email", student.getEmail());
                        studentData.put("cvStatus", student.getCvStatus().name().toLowerCase());
                        studentData.put("cvFileName", student.getCVFileName());
                        studentData.put("uploadedAt", student.getCvUploadedAt() != null ? 
                            student.getCvUploadedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "");
                        studentData.put("validatedAt", student.getCvValidatedAt() != null ? 
                            student.getCvValidatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "");
                        studentData.put("rejectionReason", student.getCvRejectionReason());
                        return studentData;
                    })
                    .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    @PostMapping("/api/internship-manager/students/{studentId}/cv/validate")
    public ResponseEntity<Map<String, String>> validateStudentCV(
            @PathVariable Long studentId, 
            @RequestParam Boolean approved, 
            @RequestParam(required = false) String reason) {
        try {
            studentService.validateStudentCV(studentId, approved, reason);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", approved ? "CV approuvé avec succès" : "CV rejeté avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Erreur lors de la validation du CV");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
