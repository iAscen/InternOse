package cal.ose.internose.service;

import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.service.DTOs.StudentDTO;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class StudentService {
    private final StudentDAO studentDAO;

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
}
