package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(Paths.INTERNSHIP_MANAGER_BASE_PATH)
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class InternshipManagerController {
    private final InternshipManagerService internshipManagerService;
    private final StudentService studentService;

    @GetMapping("/employers/internship-offers")
    public ResponseEntity<List<InternshipOfferDTO>> findInternshipOffersBy(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String valid,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String title
    ) {
        // Convertir le paramètre valid en Boolean
        Boolean booleanVerified = null;
        if (valid != null && !valid.equals("null") && !valid.isEmpty()) {
            booleanVerified = Boolean.parseBoolean(valid);
        }

        return getResponseEntity(
            HttpStatus.OK,
            null,
            internshipManagerService.findInternshipsBy(booleanVerified, program, title, sortBy)
        );
    }


    @GetMapping("/validation")
    public ResponseEntity<Map<String, Object>> getValidationStatus() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Validation endpoint available");
            response.put("endpoints", Map.of(
                "verifyOffers", "/api/internship-manager/verify",
                "verifyCVs", "/api/internship-manager/students/{studentID}/cv/validate"
            ));
            return getResponseEntity(HttpStatus.OK, null, response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erreur lors de la récupération du statut de validation"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<InternshipOfferDTO>> searchInternshipOffers(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String valid,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String title
    ) {
        try {
            Boolean verified = null;
            if (valid != null) {
                verified = Boolean.parseBoolean(valid);
            }
            
            List<InternshipOfferDTO> offers = internshipManagerService.findInternshipsBy(verified, program, title, sortBy);
            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyInternshipOffer(
        @RequestParam("offerId") Long internshipOfferID,
        @RequestParam Boolean approved,
        @RequestParam(required = false) String comment
    ) throws ResourceNotFoundException {
        internshipManagerService.verifyInternshipOffer(internshipOfferID, approved, comment);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", approved ? "Offre de stage validée avec succès" : "Offre de stage refusée avec succès");

        Map<String, Object> internshipOfferData = new HashMap<>();
        internshipOfferData.put("internshipOfferID", internshipOfferID);
        internshipOfferData.put("status", approved ? "approved" : "rejected");
        internshipOfferData.put("comment", comment != null ? comment : "");

        response.put("internshipOfferData", internshipOfferData);

        return getResponseEntity(HttpStatus.OK, null, response);
    }

    @GetMapping("/students/cvs")
    public ResponseEntity<Map<String, Object>> getAllStudentsResumes(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String sortOrder,
        @RequestParam(required = false) String status
    ) {
        // Vérification des paramètres de triage
        if (sortBy != null && sortBy.trim().isEmpty()) {
            sortBy = null; // Traiter comme si aucun tri n'était spécifié
        }
        if (sortOrder != null && sortOrder.trim().isEmpty()) {
            sortOrder = null; // Utiliser l'ordre par défaut (ascendant)
        }

        List<StudentDTO> students = studentService.getAllStudentsWithResumes(sortBy, sortOrder, status);
        List<Map<String, Object>> studentsData = students.stream().map(this::getStudentData).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", studentsData);
        response.put("studentsData", studentsData);
        response.put("totalCount", studentsData.size());

        return getResponseEntity(HttpStatus.OK, null, response);
    }

    @GetMapping("/students/{studentID}/cv")
    public ResponseEntity<Map<String, Object>> getStudentResumeDetails(@PathVariable Long studentID) {
        try {
            StudentDTO studentDTO = studentService.getStudentByID(studentID);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("studentData", getStudentData(studentDTO));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", "Étudiant non trouvé"));
        }
    }

    @GetMapping("/students/{studentID}/cv/download")
    public ResponseEntity<byte[]> downloadStudentCV(@PathVariable Long studentID) {
        try {
            StudentDTO studentDTO = studentService.getStudentByID(studentID);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", studentDTO.getResumeFileName());
            headers.setContentLength(studentDTO.getResumeFileData().length);

            return getResponseEntity(HttpStatus.OK, headers, studentDTO.getResumeFileData());
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Étudiant non trouvé".getBytes());
        }
    }

    @PostMapping("/students/{studentID}/cv/validate")
    public ResponseEntity<Map<String, Object>> verifyStudentCV(
        @PathVariable Long studentID,
        @RequestParam Boolean approved,
        @RequestParam(required = false) String reason
    ) {
        try {
            StudentDTO student = studentService.getStudentByID(studentID);
            
            // Check if student has a CV
            if (student.getResumeVerificationStatus() == cal.ose.internose.modele.VerificationStatus.NONE) {
                return ResponseEntity.status(404).body(Map.of("message", "Aucun CV trouvé pour cet étudiant"));
            }
            
            // Check if CV has already been processed
            if (student.getResumeVerificationStatus() != null && 
                student.getResumeVerificationStatus() != cal.ose.internose.modele.VerificationStatus.PENDING) {
                return ResponseEntity.status(400).body(Map.of("message", "Ce CV a déjà été traité"));
            }
            
            internshipManagerService.verifyResume(studentID, approved, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", approved ? "CV validé avec succès" : "CV refusé avec succès");
            response.put("studentData", getStudentData(student));

            return getResponseEntity(HttpStatus.OK, null, response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Erreur de service")) {
                return ResponseEntity.status(500).body(Map.of("message", "Erreur lors de la validation du CV"));
            }
            return ResponseEntity.status(404).body(Map.of("message", "Étudiant non trouvé"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", "Étudiant non trouvé"));
        }
    }

    private Map<String, Object> getStudentData(StudentDTO student) {
        Map<String, Object> studentData = new HashMap<>();
        studentData.put("studentID", student.getId());
        studentData.put("firstName", student.getFirstName());
        studentData.put("lastName", student.getLastName());
        studentData.put("email", student.getEmail());
        studentData.put("resumeFileName", student.getResumeFileName());
        studentData.put("resumeVerificationStatus", student.getResumeVerificationStatus().name().toLowerCase());
        studentData.put("resumeUploadDate",
            student.getResumeUploadDate() != null
                ? student.getResumeUploadDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : "");
        studentData.put("resumeVerifiedDate",
            student.getResumeVerifiedDate() != null
                ? student.getResumeVerifiedDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : "");
        studentData.put("resumeRejectionReason", student.getResumeRejectionReason());
        return studentData;
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, HttpHeaders headers, T body) {
        return ResponseEntity.status(status).headers(headers).body(body);
    }
}
