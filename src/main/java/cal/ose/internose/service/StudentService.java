package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InternshipOfferSearchCriteria;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.AlreadyExistsException;
import cal.ose.internose.service.exceptions.DocumentNotValidatedException;
import cal.ose.internose.service.exceptions.ResumeNotApprovedException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class StudentService {
    private final StudentDAO studentDAO;
    private final InternshipOfferDAO internshipOfferDAO;
    private final StudentApplicationDAO studentApplicationDAO;

    public Optional<Student> uploadResume(Long studentID, MultipartFile resumeFile) throws IOException {
        Student student = studentDAO.findById(studentID).orElseThrow();
        student.setResumeFileName(resumeFile.getOriginalFilename());
        student.setResumeFileType(resumeFile.getContentType());
        student.setResumeFileData(resumeFile.getBytes());
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        student.setResumeUploadDate(LocalDateTime.now());
        student.setResumeRejectionReason(null);
        student = studentDAO.save(student);
        return Optional.of(student);
    }

    public StudentDTO getStudentByID(Long studentID) {
        Student student = studentDAO.findById(studentID).orElseThrow();
        return StudentDTO.fromEntity(student);
    }

    public List<StudentDTO> getAllStudentsWithResumes(String sortBy, String sortOrder, String status) {
        List<Student> students = studentDAO.findAll().stream()
            .filter(student -> student.getResumeVerificationStatus() != VerificationStatus.NONE)
            .toList();

        if (status != null && !status.trim().isEmpty()) {
            try {
                VerificationStatus statusFilter = VerificationStatus.valueOf(status.toUpperCase());
                students = students.stream()
                    .filter(student -> student.getResumeVerificationStatus() == statusFilter)
                    .toList();
            } catch (IllegalArgumentException e) {
                // Si le statut n'est pas valide, le filtre est ignoré
            }
        }

        // Tri
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            boolean ascending = sortOrder == null || !sortOrder.equalsIgnoreCase("desc");

            switch (sortBy.toLowerCase()) {
                case "status":
                    students = students.stream()
                        .sorted((s1, s2) -> ascending
                            ? s1.getResumeVerificationStatus().name().compareTo(s2.getResumeVerificationStatus().name())
                            : s2.getResumeVerificationStatus().name().compareTo(s1.getResumeVerificationStatus().name()))
                        .toList();
                    break;
                case "name":
                    students = students.stream()
                        .sorted((firstStudent, secondStudent) -> {
                            String firstStudentName = firstStudent.getFirstName() + " " + firstStudent.getLastName();
                            String secondStudentName = secondStudent.getFirstName() + " " + secondStudent.getLastName();
                            return ascending
                                ? firstStudentName.compareToIgnoreCase(secondStudentName)
                                : secondStudentName.compareToIgnoreCase(firstStudentName);
                        })
                        .toList();
                    break;
                case "email":
                    students = students.stream()
                        .sorted((firstStudent, secondStudent) -> {
                            String firstStudentEmail;
                            String secondStudentEmail;
                            try {
                                firstStudentEmail = (firstStudent.getEmail() != null) ? firstStudent.getEmail() : "";
                            } catch (Exception e) {
                                firstStudentEmail = "";
                            }
                            try {
                                secondStudentEmail = (secondStudent.getEmail() != null) ? secondStudent.getEmail() : "";
                            } catch (Exception e) {
                                secondStudentEmail = "";
                            }
                            return ascending
                                ? firstStudentEmail.compareToIgnoreCase(secondStudentEmail)
                                : secondStudentEmail.compareToIgnoreCase(firstStudentEmail);
                        })
                        .toList();
                    break;
                case "upload_date":
                    students = students.stream()
                        .sorted((firstStudent, secondStudent) -> {
                            if (firstStudent.getResumeUploadDate() == null && secondStudent.getResumeUploadDate() == null)
                                return 0;
                            else if (firstStudent.getResumeUploadDate() == null)
                                return ascending ? 1 : -1;
                            else if (secondStudent.getResumeUploadDate() == null)
                                return ascending ? -1 : 1;
                            return ascending
                                ? firstStudent.getResumeUploadDate().compareTo(secondStudent.getResumeUploadDate())
                                : secondStudent.getResumeUploadDate().compareTo(firstStudent.getResumeUploadDate());
                        })
                        .toList();
                    break;
                default:
                    // Trier par le nom si le critère n'est pas reconnu
                    students = students.stream()
                        .sorted((firstStudent, secondStudent) -> {
                            String firstStudentName = firstStudent.getFirstName() + " " + firstStudent.getLastName();
                            String secondStudentName = secondStudent.getFirstName() + " " + secondStudent.getLastName();
                            return firstStudentName.compareToIgnoreCase(secondStudentName);
                        })
                        .toList();
                    break;
            }
        } else {
            // Trier par nom si aucun critère de tri n'est spécifié
            students = students.stream()
                .sorted((firstStudent, secondStudent) -> {
                    String firstStudentName = firstStudent.getFirstName() + " " + firstStudent.getLastName();
                    String secondStudentName = secondStudent.getFirstName() + " " + secondStudent.getLastName();
                    return firstStudentName.compareToIgnoreCase(secondStudentName);
                })
                .toList();
        }

        return StudentDTO.fromEntityList(students);
    }

    public void applyToInternshipOffer(long studentID, long internshipOfferID) throws ResumeNotApprovedException {
        Student student = studentDAO.findById(studentID).orElse(null);
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElse(null);

        // Vérifier que l'étudiant a un CV approuvé pour pouvoir postuler
        if (student != null && student.getResumeVerificationStatus() != VerificationStatus.APPROVED) {
            throw new ResumeNotApprovedException("Vous devez avoir un CV approuvé pour postuler aux offres de stage");
        }

        if (internshipOffer != null && internshipOffer.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new DocumentNotValidatedException("L'offre n'est pas validée");
        }

        boolean hasAlreadyApplied = studentApplicationDAO.existsByStudentIdAndInternshipOfferId(studentID,
            internshipOfferID);
        if (hasAlreadyApplied) {
            throw new AlreadyExistsException("Vous avez déjà postulé à cette offre");
        }

        if (student != null && internshipOffer != null) {
            StudentApplication application = StudentApplication.builder()
                .student(student)
                .internshipOffer(internshipOffer)
                .applicationDate(LocalDateTime.now())
                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                .build();
            studentApplicationDAO.save(application);

            if (internshipOffer.getApplications().isEmpty()) {
                internshipOffer.setApplications(new ArrayList<>());
            }
            internshipOffer.getApplications().add(student);
            internshipOfferDAO.save(internshipOffer);
        }
    }

    /**
     * Recherche les offres de stage avec filtres et tri
     *
     * @param criteria Critères de recherche et de filtrage
     * @return Une page avec des offres de stage correspondant aux critères
     */
    public Page<InternshipOfferDTO> searchInternshipOffers(InternshipOfferSearchCriteria criteria, Long studentID) throws ResumeNotApprovedException {
        isResumeVerified(studentID);

        int page = criteria.getPage() != null ? criteria.getPage() : 0;
        int size = criteria.getSize() != null ? criteria.getSize() : 10;
        Sort sort = createSort(criteria.getSortBy(), criteria.getSortOrder());
        Pageable pageable = PageRequest.of(page, size, sort);
        Map<String, String> searchParameters = getSearchParameters(criteria);
        Page<InternshipOffer> internshipOffersPage;

        // Utiliser la requête sans dates pour éviter les problèmes de type
        internshipOffersPage = internshipOfferDAO.findInternshipOffersWithoutDates(
            VerificationStatus.APPROVED,
            searchParameters.get("title"),
            searchParameters.get("company"),
            searchParameters.get("program"),
            criteria.getMinDuration(),
            criteria.getMaxDuration(),
            criteria.getMinSalary(),
            criteria.getMaxSalary(),
            searchParameters.get("adresse"),
            pageable
        );

        // Conversion en DTOs
        return internshipOffersPage.map(InternshipOfferDTO::fromEntity);
    }

    /**
     * Récupère une offre de stage par son ID
     *
     * @param studentID ID de l'étudiant
     * @param internshipOfferID ID de l'offre de stage
     * @return L'offre de stage si elle est trouvée et approuvée
     */
    public Optional<InternshipOfferDTO> getInternshipOfferByID(Long studentID, Long internshipOfferID)
        throws ResumeNotApprovedException {
        isResumeVerified(studentID);

        Optional<InternshipOffer> internshipOffer = internshipOfferDAO.findById(internshipOfferID);
        return internshipOffer.map(InternshipOfferDTO::fromEntity);
    }

    /**
     * Récupère toutes les offres de stage approuvées (sans filtres)
     *
     * @return Liste de toutes les offres approuvées
     */
    public List<InternshipOfferDTO> getAllApprovedInternshipOffers(Long studentID) throws ResumeNotApprovedException {
        isResumeVerified(studentID);

        List<InternshipOffer> offers = internshipOfferDAO.findAll().stream()
            .filter(offer -> offer.getVerificationStatus() == VerificationStatus.APPROVED)
            .toList();
        return InternshipOfferDTO.fromEntityList(offers);
    }

    /**
     * Compte le nombre d'offres de stage correspondant aux critères
     *
     * @param criteria Critères de recherche
     * @return Nombre d'offres de stage correspondantes
     */
    public Long countInternshipOffers(InternshipOfferSearchCriteria criteria, Long studentID) throws ResumeNotApprovedException {
        isResumeVerified(studentID);

        Map<String, String> searchParameters = getSearchParameters(criteria);

        return internshipOfferDAO.countInternshipOffersWithoutDates(
            VerificationStatus.APPROVED,
            searchParameters.get("title"),
            searchParameters.get("company"),
            searchParameters.get("program"),
            criteria.getMinDuration(),
            criteria.getMaxDuration(),
            criteria.getMinSalary(),
            criteria.getMaxSalary(),
            searchParameters.get("adresse")
        );
    }

    /**
     * Crée un objet Sort selon les critères de tri
     *
     * @param sortBy    Critère de tri
     * @param sortOrder Ordre de tri (asc/desc)
     * @return Un objet Sort correspondant
     */
    private Sort createSort(String sortBy, String sortOrder) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            // Tri par défaut par date de début (plus récent en premier)
            return Sort.by(Sort.Direction.DESC, "startDate");
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder)
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        return switch (sortBy.toLowerCase()) {
            case "title", "titre" -> Sort.by(direction, "title");
            case "company", "entreprise" -> Sort.by(direction, "employer.company");
            case "program", "programme" -> Sort.by(direction, "program");
            case "duration", "duree" -> Sort.by(direction, "duration");
            case "startdate", "datedebut" -> Sort.by(direction, "startDate");
            case "salary", "salaire" -> Sort.by(direction, "salary");
            case "address", "lieu" -> Sort.by(direction, "address");
            default -> Sort.by(Sort.Direction.DESC, "startDate");
        };
    }

    private void isResumeVerified(Long studentId) throws ResumeNotApprovedException {
        // Permettre aux étudiants de voir les offres même sans CV
        // Ils ne pourront postuler que si leur CV est approuvé
    }

    private Map<String, String> getSearchParameters(InternshipOfferSearchCriteria criteria) {
        String program = criteria.getProgram() != null ? "%" + criteria.getProgram() + "%" : null;
        String location = criteria.getAddress() != null ? "%" + criteria.getAddress() + "%" : null;
        String jobTitle = criteria.getTitle() != null ? "%" + criteria.getTitle() + "%" : null;
        String company = criteria.getCompany() != null ? "%" + criteria.getCompany() + "%" : null;

        Map<String, String> searchParameters = new HashMap<>();
        searchParameters.put("program", program);
        searchParameters.put("location", location);
        searchParameters.put("jobTitle", jobTitle);
        searchParameters.put("company", company);

        return searchParameters;
    }

    /**
     * Récupère les candidatures d'un étudiant
     *
     * @param studentID ID de l'étudiant
     * @return Liste des candidatures de l'étudiant
     */
    public List<Map<String, Object>> getStudentApplications(Long studentID) {
        List<StudentApplication> applications = studentApplicationDAO.findByStudentId(studentID);
        
        return applications.stream().map(application -> {
            Map<String, Object> appData = new HashMap<>();
            appData.put("id", application.getId());
            appData.put("internshipOfferId", application.getInternshipOffer().getId());
            appData.put("jobTitle", application.getInternshipOffer().getTitle());
            appData.put("company", application.getInternshipOffer().getEmployer().getCompany());
            appData.put("applicationDate", application.getApplicationDate());
            appData.put("applicationStatus", application.getApplicationStatus());
            appData.put("verificationStatus", application.getInternshipOffer().getVerificationStatus());
            return appData;
        }).collect(Collectors.toList());
    }
}
