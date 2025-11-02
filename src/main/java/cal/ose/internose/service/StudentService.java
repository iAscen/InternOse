package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentApplicationDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.InternshipOfferNotApprovedException;
import cal.ose.internose.service.exceptions.InterviewAlreadyScheduledException;
import cal.ose.internose.service.exceptions.ResumeNotApprovedException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

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

    public List<StudentDTO> getAllStudentsWithResumes(String sortBy, String sortOrder, String verificationStatus) {
        List<Student> students = studentDAO.findAll().stream()
            .filter(student -> student.getResumeVerificationStatus() != VerificationStatus.NONE)
            .toList();

        if (verificationStatus != null && !verificationStatus.trim().isEmpty()) {
            try {
                VerificationStatus verificationStatusFilter = VerificationStatus.valueOf(verificationStatus.toUpperCase());
                students = students.stream()
                    .filter(student -> student.getResumeVerificationStatus() == verificationStatusFilter)
                    .toList();
            } catch (IllegalArgumentException e) {
                // Si le statut n'est pas valide, le filtre est ignoré
            }
        }

        // Tri
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            boolean ascending = sortOrder == null || !sortOrder.equalsIgnoreCase("desc");

            switch (sortBy.toLowerCase()) {
                case "verification-status":
                    students = students.stream()
                        .sorted((s1, s2) -> ascending
                            ? s1.getResumeVerificationStatus().toString().compareTo(s2.getResumeVerificationStatus().toString())
                            : s2.getResumeVerificationStatus().toString().compareTo(s1.getResumeVerificationStatus().toString())
                        )
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

    public void applyToInternshipOffer(long studentID, long internshipOfferID)
        throws ResumeNotApprovedException, InternshipOfferNotApprovedException, InterviewAlreadyScheduledException {
        Student student = studentDAO.findById(studentID).orElse(null);
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElse(null);

        if (student != null && student.getResumeVerificationStatus() != VerificationStatus.APPROVED)
            throw new ResumeNotApprovedException();

        if (internshipOffer != null && internshipOffer.getVerificationStatus() != VerificationStatus.APPROVED)
            throw new InternshipOfferNotApprovedException();

        boolean hasAlreadyApplied = studentApplicationDAO.existsByStudentAndInternshipOffer(student, internshipOffer);
        if (hasAlreadyApplied)
            throw new InterviewAlreadyScheduledException("Vous avez déjà postulé.e à cette offre de stage");

        if (student != null && internshipOffer != null) {
            StudentApplication application = StudentApplication.builder()
                .student(student)
                .internshipOffer(internshipOffer)
                .applicationDate(LocalDateTime.now())
                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                .build();
            studentApplicationDAO.save(application);

            if (internshipOffer.getApplications().isEmpty()) internshipOffer.setApplications(new ArrayList<>());
            internshipOffer.getApplications().add(student);
            internshipOfferDAO.save(internshipOffer);
        }
    }

    public InternshipOfferDTO getInternshipOfferByID(Long internshipOfferID) {
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        return InternshipOfferDTO.fromEntity(internshipOffer);
    }

    public List<InternshipOfferDTO> getAllApprovedInternshipOffers(Long studentID) {
        List<InternshipOffer> approvedInternshipOffers = internshipOfferDAO.findAll()
            .stream()
            .filter(offer -> offer.getVerificationStatus() == VerificationStatus.APPROVED)
            .toList();

        return approvedInternshipOffers.stream().map(internshipOffer -> {
            InternshipOfferDTO internshipOfferDTO = InternshipOfferDTO.fromEntity(internshipOffer);
            Student student = studentDAO.findById(studentID).orElseThrow();
            Optional<StudentApplication> studentApplication =
                studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer);
            studentApplication.ifPresent(
                application -> internshipOfferDTO.setApplicationStatus(application.getApplicationStatus().toString())
            );
            return internshipOfferDTO;
        }).toList();
    }

    public List<StudentApplicationDTO> getStudentApplications(Long studentID) {
        Student student = studentDAO.findById(studentID).orElseThrow();
        return StudentApplicationDTO.fromEntityList(studentApplicationDAO.findByStudent(student));
    }

    public void respondToApprovedOffer(Long studentID, Long internshipOfferID, boolean accepted) throws Exception {
        Student student = studentDAO.findById(studentID).orElseThrow();
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        StudentApplication studentApplication = studentApplicationDAO
            .findByStudentAndInternshipOffer(student, internshipOffer)
            .orElseThrow(() -> new NoSuchElementException("Vous n'avez pas postulé à cette offre de stage"));
        
        if (studentApplication.getApplicationStatus() != StudentApplication.ApplicationStatus.APPROVED)
            throw new Exception("Cette offre n'a pas été acceptée par l'employeur ou a déjà été traitée");
        
        if (internshipOffer.getExpirationDate() != null && internshipOffer.getExpirationDate().isBefore(java.time.LocalDate.now()))
            throw new Exception("Cette offre de stage a expiré, vous ne pouvez plus y répondre");
        
        studentApplication.setApplicationStatus(accepted 
            ? StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT 
            : StudentApplication.ApplicationStatus.REJECTED_BY_STUDENT);
        studentApplicationDAO.save(studentApplication);
    }
}
