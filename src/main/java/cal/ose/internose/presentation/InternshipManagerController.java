package cal.ose.internose.presentation;

import cal.ose.internose.modele.CVStatus;
import cal.ose.internose.modele.Student;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cal.ose.internose.security.Paths;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipManagerController {
    private final InternshipManagerService internshipManagerService;
    private final StudentService studentService;

    public InternshipManagerController(InternshipManagerService internshipManagerService,
            StudentService studentService) {
        this.internshipManagerService = internshipManagerService;
        this.studentService = studentService;
    }

    @GetMapping(Paths.SEARCH_INTERNSHIPS_PATH)
    public ResponseEntity<List<InternshipOfferDTO>> findInternshipsBy(@RequestParam(required = false) String domain,
                                                                      @RequestParam(required = false) String valid,
                                                                      @RequestParam(required = false) String title,
                                                                      @RequestParam(required = false) String sortBy) {
        // Convertir le paramètre valid de String vers Boolean
        Boolean validBoolean = null;
        if (valid != null && !valid.isEmpty() && !valid.equals("null")) {
            validBoolean = Boolean.parseBoolean(valid);
        }
        
        return ResponseEntity.status(HttpStatus.OK)
                .body(internshipManagerService.findInternshipsBy(domain, validBoolean, title, sortBy));
    }

    @GetMapping(Paths.INTERNSHIP_VALIDATION_PATH)
    public ResponseEntity<String> validateInternshipOffer(@RequestParam Long offerId, @RequestParam Boolean approved,
            @RequestParam(required = false) String commentaire) {
        internshipManagerService.validateInternshipOffer(offerId, approved, commentaire);

        return ResponseEntity.status(HttpStatus.OK).body(Paths.INTERNSHIP_VALIDATION_PATH);
    }

    @GetMapping("/api/internship-manager/students/cvs")
    public ResponseEntity<Map<String, Object>> getAllStudentCVs(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String institution) {
        try {
            // Validation des paramètres de tri
            if (sortBy != null && sortBy.trim().isEmpty()) {
                sortBy = null; // Traiter comme si aucun tri n'était spécifié
            }
            if (sortOrder != null && sortOrder.trim().isEmpty()) {
                sortOrder = null; // Utiliser l'ordre par défaut (ascendant)
            }

            List<Student> students = studentService.getAllStudentsWithCVs(sortBy, sortOrder, status, program,
                    institution);
            List<Map<String, Object>> response = students.stream()
                    .map(student -> {
                        Map<String, Object> studentData = new HashMap<>();
                        studentData.put("studentId", student.getId());
                        studentData.put("firstName", student.getFirstName());
                        studentData.put("lastName", student.getLastName());
                        studentData.put("email", student.getEmail());
                        studentData.put("cvStatus", student.getCvStatus().name().toLowerCase());
                        studentData.put("cvFileName", student.getCVFileName());
                        studentData.put("uploadedAt",
                                student.getCvUploadedAt() != null
                                        ? student.getCvUploadedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                                        : "");
                        studentData.put("validatedAt",
                                student.getCvValidatedAt() != null
                                        ? student.getCvValidatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                                        : "");
                        studentData.put("rejectionReason", student.getCvRejectionReason());
                        return studentData;
                    })
                    .toList();

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            result.put("totalCount", response.size());
            result.put("message", "CVs récupérés avec succès");

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("data", List.of());
            errorResponse.put("totalCount", 0);
            errorResponse.put("error", "Erreur lors du chargement des CV. Veuillez réessayer.");
            errorResponse.put("message",
                    "Une erreur technique s'est produite. Veuillez contacter l'administrateur si le problème persiste.");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/api/internship-manager/students/{studentId}/cv")
    public ResponseEntity<Map<String, Object>> getStudentCVDetails(@PathVariable Long studentId) {
        try {
            Optional<Student> studentOpt = studentService.getStudentById(studentId);

            if (studentOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Étudiant non trouvé");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            Student student = studentOpt.get();

            if (student.getCvStatus() == CVStatus.NONE) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Aucun CV trouvé pour cet étudiant");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                    "studentId", student.getId(),
                    "firstName", student.getFirstName(),
                    "lastName", student.getLastName(),
                    "email", student.getEmail(),
                    "cvStatus", student.getCvStatus().name().toLowerCase(),
                    "cvFileName", student.getCVFileName(),
                    "cvFileType", student.getCVFileType(),
                    "uploadedAt",
                    student.getCvUploadedAt() != null
                            ? student.getCvUploadedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                            : "",
                    "validatedAt",
                    student.getCvValidatedAt() != null
                            ? student.getCvValidatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                            : "",
                    "rejectionReason", student.getCvRejectionReason()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Erreur lors de la récupération des détails du CV");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/api/internship-manager/students/{studentId}/cv/download")
    public ResponseEntity<byte[]> downloadStudentCV(@PathVariable Long studentId) {
        try {
            Optional<Student> studentOpt = studentService.getStudentById(studentId);

            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new byte[0]);
            }

            Student student = studentOpt.get();

            if (student.getCvStatus() == CVStatus.NONE || student.getCVFileData() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new byte[0]);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", student.getCVFileName());
            headers.setContentLength(student.getCVFileData().length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(student.getCVFileData());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new byte[0]);
        }
    }

}
