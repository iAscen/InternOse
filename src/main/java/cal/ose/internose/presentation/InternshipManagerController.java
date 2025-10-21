package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
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

    @GetMapping(Paths.INTERNSHIP_MANAGER_OFFERS_PATH)
    public ResponseEntity<List<InternshipOfferDTO>> findInternshipOffersBy(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String verified,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String title
    ) {
        // Convertir le paramètre verified en Boolean
        Boolean booleanVerified = null;
        if (verified != null && !verified.equals("null") && !verified.isEmpty()) {
            booleanVerified = Boolean.parseBoolean(verified);
        }

        return getResponseEntity(
            HttpStatus.OK,
            null,
            internshipManagerService.findInternshipsBy(booleanVerified, program, title, sortBy)
        );
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH)
    public ResponseEntity<Map<String, Object>> verifyInternshipOffer(
        @RequestParam Long internshipOfferID,
        @RequestParam Boolean approved,
        @RequestParam(required = false) String comment
    ) {
        internshipManagerService.verifyInternshipOffer(internshipOfferID, approved, comment);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);

        Map<String, Object> internshipOfferData = new HashMap<>();
        internshipOfferData.put("internshipOfferID", internshipOfferID);
        internshipOfferData.put("status", approved ? "approved" : "rejected");
        internshipOfferData.put("comment", comment != null ? comment : "");

        response.put("internshipOfferData", internshipOfferData);

        return getResponseEntity(HttpStatus.OK, null, response);
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_RESUMES_PATH)
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
        response.put("studentsData", studentsData);
        response.put("resumeCount", studentsData.size());

        return getResponseEntity(HttpStatus.OK, null, response);
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_RESUME_PATH)
    public ResponseEntity<Map<String, Object>> getStudentResumeDetails(@PathVariable Long studentID) {
        StudentDTO studentDTO = studentService.getStudentByID(studentID);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("studentData", getStudentData(studentDTO));

        return ResponseEntity.ok(response);
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH)
    public ResponseEntity<byte[]> downloadStudentCV(@PathVariable Long studentID) {
        StudentDTO studentDTO = studentService.getStudentByID(studentID);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", studentDTO.getResumeFileName());
        headers.setContentLength(studentDTO.getResumeFileData().length);

        return getResponseEntity(HttpStatus.OK, headers, studentDTO.getResumeFileData());
    }

    @PostMapping(Paths.INTERNSHIP_MANAGER_VERIFY_RESUME_PATH)
    public ResponseEntity<Map<String, Object>> verifyStudentCV(
        @PathVariable Long studentID,
        @RequestParam Boolean approved,
        @RequestParam(required = false) String reason
    ) {
        StudentDTO student = studentService.getStudentByID(studentID);
        internshipManagerService.verifyResume(studentID, approved, reason);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("studentData", getStudentData(student));

        return getResponseEntity(HttpStatus.OK, null, response);
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
