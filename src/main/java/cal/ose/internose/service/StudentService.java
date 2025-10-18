package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InternshipOfferSearchCriteria;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentService {
    private final StudentDAO studentDAO;
    private final InternshipOfferDAO internshipOfferDAO;
    private final StudentApplicationDAO studentApplicationDAO;

    public StudentService(StudentDAO studentDAO, InternshipOfferDAO internshipOfferDAO, StudentApplicationDAO studentApplicationDAO) {
        this.studentDAO = studentDAO;
        this.internshipOfferDAO = internshipOfferDAO;
        this.studentApplicationDAO = studentApplicationDAO;
    }

    public Optional<Student> uploadCV(Long studentID, MultipartFile CVFile) throws IOException {
        Student student = studentDAO.findById(studentID).orElseThrow();
        student.setCVFileName(CVFile.getOriginalFilename());
        student.setCVFileType(CVFile.getContentType());
        student.setCVFileData(CVFile.getBytes());
        student.setCvStatus(DocumentStatus.PENDING);
        student.setCvUploadedAt(LocalDateTime.now());
        student.setCvRejectionReason(null); // Reset rejection reason when uploading new CV
        student = studentDAO.save(student);
        return Optional.of(student);
    }

    public Optional<Student> getStudentById(Long studentId) {
        return studentDAO.findById(studentId);
    }

    public List<Student> getAllStudentsWithCVs() {
        return studentDAO.findAll().stream()
                .filter(student -> student.getCvStatus() != DocumentStatus.NONE)
                .toList();
    }

    public List<Student> getAllStudentsWithCVs(String sortBy, String sortOrder, String status) {
        List<Student> students = studentDAO.findAll().stream()
                .filter(student -> student.getCvStatus() != DocumentStatus.NONE)
                .toList();

        // Filtrage par statut
        if (status != null && !status.trim().isEmpty()) {
            try {
                DocumentStatus statusFilter = DocumentStatus.valueOf(status.toUpperCase());
                students = students.stream()
                        .filter(student -> student.getCvStatus() == statusFilter)
                        .toList();
            } catch (IllegalArgumentException e) {
                // Si le statut n'est pas valide, on ignore le filtre et on continue avec tous
                // les CV
            }
        }

        // Tri
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            boolean ascending = sortOrder == null || !sortOrder.toLowerCase().equals("desc");

            switch (sortBy.toLowerCase()) {
                case "name":
                case "nom":
                    students = students.stream()
                            .sorted((s1, s2) -> {
                                String name1 = s1.getFirstName() + " " + s1.getLastName();
                                String name2 = s2.getFirstName() + " " + s2.getLastName();
                                return ascending ? name1.compareToIgnoreCase(name2) : name2.compareToIgnoreCase(name1);
                            })
                            .toList();
                    break;
                case "date":
                case "uploadedat":
                    students = students.stream()
                            .sorted((s1, s2) -> {
                                if (s1.getCvUploadedAt() == null && s2.getCvUploadedAt() == null)
                                    return 0;
                                if (s1.getCvUploadedAt() == null)
                                    return ascending ? 1 : -1;
                                if (s2.getCvUploadedAt() == null)
                                    return ascending ? -1 : 1;
                                return ascending ? s1.getCvUploadedAt().compareTo(s2.getCvUploadedAt())
                                        : s2.getCvUploadedAt().compareTo(s1.getCvUploadedAt());
                            })
                            .toList();
                    break;
                case "status":
                case "statut":
                    students = students.stream()
                            .sorted((s1, s2) -> {
                                return ascending ? s1.getCvStatus().name().compareTo(s2.getCvStatus().name())
                                        : s2.getCvStatus().name().compareTo(s1.getCvStatus().name());
                            })
                            .toList();
                    break;
                case "email":
                    students = students.stream()
                            .sorted((s1, s2) -> {
                                String email1 = "";
                                String email2 = "";
                                try {
                                    email1 = (s1.getEmail() != null) ? s1.getEmail() : "";
                                } catch (Exception e) {
                                    email1 = "";
                                }
                                try {
                                    email2 = (s2.getEmail() != null) ? s2.getEmail() : "";
                                } catch (Exception e) {
                                    email2 = "";
                                }
                                return ascending ? email1.compareToIgnoreCase(email2)
                                        : email2.compareToIgnoreCase(email1);
                            })
                            .toList();
                    break;
                default:
                    // Tri par défaut par nom si le critère n'est pas reconnu
                    students = students.stream()
                            .sorted((s1, s2) -> {
                                String name1 = s1.getFirstName() + " " + s1.getLastName();
                                String name2 = s2.getFirstName() + " " + s2.getLastName();
                                return name1.compareToIgnoreCase(name2);
                            })
                            .toList();
                    break;
            }
        } else {
            // Tri par défaut par nom si aucun critère de tri n'est spécifié
            students = students.stream()
                    .sorted((s1, s2) -> {
                        String name1 = s1.getFirstName() + " " + s1.getLastName();
                        String name2 = s2.getFirstName() + " " + s2.getLastName();
                        return name1.compareToIgnoreCase(name2);
                    })
                    .toList();
        }

        return students;
    }

    // methode pour test dans le commandLineRunner
    public void applyToInternship(long studentId, long internshipId) {
        Student student = studentDAO.findById(studentId).orElse(null);
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipId).orElse(null);

        if (student != null && internshipOffer != null) {
            // Create application record
            StudentApplication application = StudentApplication.builder()
                    .student(student)
                    .internshipOffer(internshipOffer)
                    .applicationDate(LocalDateTime.now())
                    .status(StudentApplication.ApplicationStatus.PENDING)
                    .build();
            
            studentApplicationDAO.save(application);

            // Also maintain the many-to-many relationship for backward compatibility
            if (internshipOffer.getStudents() == null) {
                internshipOffer.setStudents(new ArrayList<>());
            }
            internshipOffer.getStudents().add(student);
            internshipOfferDAO.save(internshipOffer);
        }
    }

    // ========== MÉTHODES POUR LA GESTION DES OFFRES DE STAGE ==========

    /**
     * Recherche les offres de stage avec filtres et tri
     * @param criteria Critères de recherche et filtrage
     * @return Page d'offres de stage correspondant aux critères
     */
    public Page<InternshipOfferDTO> searchInternshipOffers(InternshipOfferSearchCriteria criteria, Long studentId) {

        validationCv(studentId);

        // Configuration de la pagination
        int page = criteria.getPage() != null ? criteria.getPage() : 0;
        int size = criteria.getSize() != null ? criteria.getSize() : 10;

        // Configuration du tri
        Sort sort = createSort(criteria.getSortBy(), criteria.getSortOrder());
        Pageable pageable = PageRequest.of(page, size, sort);

        // Préparation des paramètres de recherche avec wildcards
        String program = criteria.getProgram() != null ? "%" + criteria.getProgram() + "%" : null;
        String location = criteria.getLocation() != null ? "%" + criteria.getLocation() + "%" : null;
        String jobTitle = criteria.getJobTitle() != null ? "%" + criteria.getJobTitle() + "%" : null;
        String company = criteria.getCompany() != null ? "%" + criteria.getCompany() + "%" : null;

        // Conversion des dates si elles sont des strings
        LocalDate startDateFrom = criteria.getStartDateFrom();
        LocalDate startDateTo = criteria.getStartDateTo();

        // Si les dates sont des strings, les parser
        if (startDateFrom == null && criteria.getStartDateFrom() != null) {
            try {
                startDateFrom = LocalDate.parse(criteria.getStartDateFrom().toString());
            } catch (Exception e) {
                startDateFrom = null;
            }
        }
        if (startDateTo == null && criteria.getStartDateTo() != null) {
            try {
                startDateTo = LocalDate.parse(criteria.getStartDateTo().toString());
            } catch (Exception e) {
                startDateTo = null;
            }
        }

        // Recherche avec filtres
        Page<InternshipOffer> offers;

        // Utiliser la requête sans dates pour éviter les problèmes de type
        offers = internshipOfferDAO.findInternshipOffersWithoutDates(
                DocumentStatus.APPROVED, // Seules les offres approuvées
                program,
                location,
                jobTitle,
                company,
                criteria.getMinSalary(),
                criteria.getMaxSalary(),
                criteria.getMinDuration(),
                criteria.getMaxDuration(),
                pageable
        );

        // Conversion en DTOs
        return offers.map(InternshipOfferDTO::fromEntity);
    }


    /**
     * Récupère une offre de stage par son ID
     * @param offerId ID de l'offre
     * @return Offre de stage si trouvée et approuvée
     */
    public Optional<InternshipOfferDTO> getInternshipOfferById(Long offerId, Long studentId) {

        validationCv(studentId);

        Optional<InternshipOffer> offer = Optional.ofNullable(
                internshipOfferDAO.findByIdAndStatus(offerId, DocumentStatus.APPROVED)
        );
        return offer.map(InternshipOfferDTO::fromEntity);
    }

    /**
     * Récupère toutes les offres de stage approuvées (sans filtres)
     * @return Liste de toutes les offres approuvées
     */
    public List<InternshipOfferDTO> getAllApprovedInternshipOffers(Long studentId) {

        validationCv(studentId);

        List<InternshipOffer> offers = internshipOfferDAO.findAll().stream()
                .filter(offer -> offer.getValidationStatus() == DocumentStatus.APPROVED)
                .toList();
        return InternshipOfferDTO.fromEntityList(offers);
    }

    /**
     * Compte le nombre d'offres correspondant aux critères
     * @param criteria Critères de recherche
     * @return Nombre d'offres correspondantes
     */
    public long countInternshipOffers(InternshipOfferSearchCriteria criteria, Long studentId) {

        validationCv(studentId);

        // Préparation des paramètres de recherche avec wildcards
        String program = criteria.getProgram() != null ? "%" + criteria.getProgram() + "%" : null;
        String location = criteria.getLocation() != null ? "%" + criteria.getLocation() + "%" : null;
        String jobTitle = criteria.getJobTitle() != null ? "%" + criteria.getJobTitle() + "%" : null;
        String company = criteria.getCompany() != null ? "%" + criteria.getCompany() + "%" : null;

        return internshipOfferDAO.countInternshipOffersWithoutDates(
                DocumentStatus.APPROVED,
                program,
                location,
                jobTitle,
                company,
                criteria.getMinSalary(),
                criteria.getMaxSalary(),
                criteria.getMinDuration(),
                criteria.getMaxDuration()
        );
    }

    /**
     * Crée un objet Sort basé sur les critères de tri
     * @param sortBy Critère de tri
     * @param sortOrder Ordre de tri (asc/desc)
     * @return Objet Sort configuré
     */
    private Sort createSort(String sortBy, String sortOrder) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            // Tri par défaut par date de début (plus récent en premier)
            return Sort.by(Sort.Direction.DESC, "startDate");
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? 
                Sort.Direction.DESC : Sort.Direction.ASC;

        return switch (sortBy.toLowerCase()) {
            case "jobtitle", "titre" -> Sort.by(direction, "jobTitle");
            case "company", "entreprise" -> Sort.by(direction, "employer.enterprise");
            case "startdate", "datedebut" -> Sort.by(direction, "startDate");
            case "salary", "salaire" -> Sort.by(direction, "salary");
            case "duration", "duree" -> Sort.by(direction, "duration");
            case "program", "discipline" -> Sort.by(direction, "program");
            case "address", "lieu" -> Sort.by(direction, "address");
            default -> Sort.by(Sort.Direction.DESC, "startDate");
        };
    }

    private void validationCv(Long studentId) {
        Student student = studentDAO.findById(studentId).orElseThrow();

        System.out.println("gonna call cvIsValidee for student " + studentId + "");

        if (!student.cvIsValidee()) {
            System.out.println("error for student " + studentId + "");
            throw new IllegalArgumentException("Le CV du stagiaire n'est pas valide");
        }
        else {
            System.out.println("cvIsValidee for student " + studentId + " is OK");
        }
    }
}
