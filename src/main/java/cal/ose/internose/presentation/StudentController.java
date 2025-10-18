package cal.ose.internose.presentation;

import cal.ose.internose.modele.Student;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InternshipOfferSearchCriteria;
import cal.ose.internose.service.StudentService;
import cal.ose.internose.service.exceptions.DocumentNotValidatedException;
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

    /**
     * Récupère toutes les offres de stage disponibles pour les étudiants
     * @return Liste de toutes les offres approuvées
     */
    @GetMapping(Paths.STUDENT_INTERNSHIP_OFFERS_PATH)
    public ResponseEntity<Map<String, Object>> getAllInternshipOffers(@RequestParam Long studentId) {
        Map<String, Object> errorResponse = new HashMap<>();

        try {
            List<InternshipOfferDTO> offers = studentService.getAllApprovedInternshipOffers(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("offers", offers);
            return getResponseEntity(HttpStatus.OK, response);
        } catch (DocumentNotValidatedException e) {
            errorResponse.put("error", "Erreur lors de la recherche des offres de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.UNPROCESSABLE_ENTITY, errorResponse);
        } catch (Exception e) {
            errorResponse.put("error", "Erreur lors de la recherche des offres de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, errorResponse);
        }
    }

    /**
     * Recherche les offres de stage avec filtres et tri
     * @param program Discipline/Programme
     * @param location Lieu (adresse)
     * @param jobTitle Titre du poste
     * @param company Nom de l'entreprise
     * @param minSalary Salaire minimum
     * @param maxSalary Salaire maximum
     * @param minDuration Durée minimum (en semaines)
     * @param maxDuration Durée maximum (en semaines)
     * @param startDateFrom Date de début minimum (format: yyyy-MM-dd)
     * @param startDateTo Date de début maximum (format: yyyy-MM-dd)
     * @param sortBy Critère de tri (jobTitle, company, startDate, salary, duration, program, address)
     * @param sortOrder Ordre de tri (asc, desc)
     * @param page Numéro de page (défaut: 0)
     * @param size Taille de page (défaut: 10)
     * @return Page d'offres de stage correspondant aux critères
     */
    @GetMapping(Paths.STUDENT_INTERNSHIP_OFFERS_PATH + "/search")
    public ResponseEntity<Map<String, Object>> searchInternshipOffers(
            @RequestParam() Long studentId,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) String startDateFrom,
            @RequestParam(required = false) String startDateTo,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        Map<String, Object> errorResponse = new HashMap<>();
        try {
            // Construction des critères de recherche
            InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                    .program(program)
                    .location(location)
                    .jobTitle(jobTitle)
                    .company(company)
                    .minSalary(minSalary)
                    .maxSalary(maxSalary)
                    .minDuration(minDuration)
                    .maxDuration(maxDuration)
                    .startDateFrom(parseDate(startDateFrom))
                    .startDateTo(parseDate(startDateTo))
                    .sortBy(sortBy)
                    .sortOrder(sortOrder)
                    .page(page)
                    .size(size)
                    .build();

            // Recherche des offres
            Page<InternshipOfferDTO> offersPage = studentService.searchInternshipOffers(criteria, studentId);
            long totalCount = studentService.countInternshipOffers(criteria , studentId);

            // Construction de la réponse
            Map<String, Object> response = new HashMap<>();
            response.put("offers", offersPage.getContent());
            response.put("totalElements", totalCount);
            response.put("totalPages", offersPage.getTotalPages());
            response.put("currentPage", offersPage.getNumber());
            response.put("size", offersPage.getSize());
            response.put("hasNext", offersPage.hasNext());
            response.put("hasPrevious", offersPage.hasPrevious());

            return getResponseEntity(HttpStatus.OK, response);
        } catch (DocumentNotValidatedException e) {
            errorResponse.put("error", "Erreur lors de la recherche des offres de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.UNPROCESSABLE_ENTITY, errorResponse);
        } catch (Exception e) {
            errorResponse.put("error", "Erreur lors de la recherche des offres de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, errorResponse);
        }
    }

    /**
     * Récupère les détails d'une offre de stage spécifique
     * @param offerId ID de l'offre de stage
     * @return Détails de l'offre de stage
     */
    @GetMapping(Paths.STUDENT_INTERNSHIP_OFFER_DETAILS_PATH + "/{offerId}")
    public ResponseEntity<Map<String, Object>> getInternshipOfferDetails(@PathVariable Long offerId, @RequestParam Long studentId) {
        Map<String, Object> errorResponse = new HashMap<>();

        try {
            return studentService.getInternshipOfferById(offerId, studentId)
                    .map(offer -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("offer", offer);
                        return getResponseEntity(HttpStatus.OK, response);
                    })
                    .orElseGet(() -> {
                        errorResponse.put("error", "Offre de stage non trouvée");
                        errorResponse.put("message", "L'offre de stage demandée n'existe pas ou n'est pas disponible");
                        return getResponseEntity(HttpStatus.NOT_FOUND, errorResponse);
                    });
        } catch (DocumentNotValidatedException e) {
            errorResponse.put("error", "Erreur lors de la recherche des offres de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.UNPROCESSABLE_ENTITY, errorResponse);
        }catch (Exception e) {
            errorResponse.put("error", "Erreur lors de la récupération de l'offre de stage");
            errorResponse.put("message", e.getMessage());
            return getResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, errorResponse);
        }
    }

    /**
     * Parse une date depuis un string au format yyyy-MM-dd
     * @param dateString String de la date
     * @return LocalDate ou null si le string est null/vide
     */
    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateString);
        } catch (Exception e) {
            return null;
        }
    }

    private <T> ResponseEntity<T> getResponseEntity(HttpStatus status, T body) {
        return ResponseEntity.status(status).body(body);
    }
}
