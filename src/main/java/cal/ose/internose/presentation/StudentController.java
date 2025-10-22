package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InternshipOfferSearchCriteria;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.StudentService;
import cal.ose.internose.service.exceptions.ResumeNotApprovedException;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(Paths.STUDENT_BASE_PATH)
@CrossOrigin("http://localhost:5173")
@AllArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @GetMapping("/resume/status")
    public ResponseEntity<Map<String, Object>> getResumeStatus(@RequestParam("studentID") Long studentID) {
        System.out.println("🔍 /resume/status called with studentID: " + studentID);
        return getCVStatus(studentID);
    }

    @GetMapping("/cv/status")
    public ResponseEntity<Map<String, Object>> getCVStatus(@RequestParam("studentID") Long studentID) {
        try {
            System.out.println("🔍 /cv/status called with studentID: " + studentID);
            StudentDTO student = studentService.getStudentByID(studentID);
            System.out.println("🔍 Student found: " + (student != null ? "Yes" : "No"));
            if (student != null) {
                System.out.println("🔍 Student resume status: " + student.getResumeVerificationStatus());
            }

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
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Student not found")) {
                return getResponseEntity(HttpStatus.NOT_FOUND, Map.of("error", "Étudiant non trouvé"));
            }
            return getResponseEntity(
                HttpStatus.INTERNAL_SERVER_ERROR,
                Map.of("error", "Erreur lors de la récupération du statut du CV")
            );
        } catch (Exception e) {
            return getResponseEntity(
                HttpStatus.INTERNAL_SERVER_ERROR,
                Map.of("error", "Erreur lors de la récupération du statut du CV")
            );
        }
    }

    @PostMapping("/resume")
    public ResponseEntity<String> uploadResume(@RequestParam("studentID") Long studentID, @RequestParam("file") MultipartFile CVFile) {
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

    /**
     * Récupère toutes les offres de stage disponibles pour les étudiants
     *
     * @return Liste de toutes les offres de stage approuvées
     */
    @GetMapping("/internship-offers")
    public ResponseEntity<Map<String, Object>> getAllInternshipOffers(@RequestParam Long studentID) {
        try {
            List<InternshipOfferDTO> offers = studentService.getAllApprovedInternshipOffers(studentID);
            Map<String, Object> response = new HashMap<>();
            response.put("internshipOffers", offers);
            return getResponseEntity(HttpStatus.OK, response);
        } catch (ResumeNotApprovedException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Votre CV n'est pas approuvé");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.FORBIDDEN, errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur lors de la recherche des offres de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, errorResponse);
        }
    }

    /**
     * Recherche les offres de stage avec filtres et tri
     *
     * @param title         Programme
     * @param company       Nom de l'entreprise
     * @param minDuration   Durée minimum (en semaines)
     * @param maxDuration   Durée maximum (en semaines)
     * @param startDateFrom Date de début minimum (format: yyyy-MM-dd)
     * @param startDateTo   Date de début maximum (format: yyyy-MM-dd)
     * @param minSalary     Salaire minimum
     * @param maxSalary     Salaire maximum
     * @param address       Lieu (adresse)
     * @param sortBy        Critère de tri (jobTitle, company, startDate, salary, duration, program, address)
     * @param sortOrder     Ordre de tri (asc, desc)
     * @param page          Numéro de page (défaut: 0)
     * @param size          Taille de page (défaut: 10)
     * @return Une page avec des offres de stage correspondant aux critères
     */
    @GetMapping("/internship-offers/search")
    public ResponseEntity<Map<String, Object>> searchInternshipOffers(
        @RequestParam() Long studentID,
        @RequestParam(required = false) String title,
        @RequestParam(required = false) String company,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) Integer minDuration,
        @RequestParam(required = false) Integer maxDuration,
        @RequestParam(required = false) String startDateFrom,
        @RequestParam(required = false) String startDateTo,
        @RequestParam(required = false) Double minSalary,
        @RequestParam(required = false) Double maxSalary,
        @RequestParam(required = false) String address,
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String sortOrder,
        @RequestParam(required = false, defaultValue = "0") Integer page,
        @RequestParam(required = false, defaultValue = "10") Integer size) {
        System.out.println("🔍 /internship-offers/search called with studentID: " + studentID);

        try {
            InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                .title(title)
                .company(company)
                .program(program)
                .minDuration(minDuration)
                .maxDuration(maxDuration)
                .startDateFrom(startDateFrom != null ? LocalDate.parse(startDateFrom) : null)
                .startDateTo(startDateTo != null ? LocalDate.parse(startDateTo) : null)
                .minSalary(minSalary)
                .maxSalary(maxSalary)
                .address(address)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .page(page)
                .size(size)
                .build();

            Page<InternshipOfferDTO> offersPage = studentService.searchInternshipOffers(criteria, studentID);
            Long totalCount = studentService.countInternshipOffers(criteria, studentID);

            // Construction de la réponse
            Map<String, Object> response = new HashMap<>();
            response.put("offers", offersPage.getContent());
            response.put("count", totalCount);
            response.put("totalElements", totalCount);
            response.put("pages", offersPage.getTotalPages());
            response.put("totalPages", offersPage.getTotalPages());
            response.put("currentPage", offersPage.getNumber());
            response.put("size", offersPage.getSize());
            response.put("hasNext", offersPage.hasNext());
            response.put("hasPrevious", offersPage.hasPrevious());

            return getResponseEntity(HttpStatus.OK, response);
        } catch (ResumeNotApprovedException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Votre CV n'est pas approuvé");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.UNPROCESSABLE_ENTITY, errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur lors de la recherche des offres de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, errorResponse);
        }
    }

    /**
     * Récupère les détails d'une offre de stage spécifique
     *
     * @param offerID ID de l'offre de stage
     * @return Détails de l'offre de stage
     */
    @GetMapping("/internship-offers/{offerID}")
    public ResponseEntity<Map<String, Object>> getInternshipOfferDetails(
        @PathVariable Long offerID,
        @RequestParam Long studentID
    ) {
        try {
            Optional<InternshipOfferDTO> offer = studentService.getInternshipOfferByID(studentID, offerID);
            if (offer.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Offre de stage non trouvée");
                return getResponseEntity(HttpStatus.NOT_FOUND, errorResponse);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("internshipOffer", offer.get());
            response.put("offer", offer.get());
            return getResponseEntity(HttpStatus.OK, response);
        } catch (ResumeNotApprovedException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Votre CV n'est pas approuvé");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.FORBIDDEN, errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur est survenue lors de la récupération de l'offre de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, errorResponse);
        }
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
