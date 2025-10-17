package cal.ose.internose.service;

import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.persistance.StudentDAO;
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

    public Optional<Student> uploadCV(Long studentID, MultipartFile resumeFile) throws IOException {
        Student student = studentDAO.findById(studentID).orElseThrow();
        student.setResumeFileName(resumeFile.getOriginalFilename());
        student.setResumeFileType(resumeFile.getContentType());
        student.setResumeFileData(resumeFile.getBytes());
        student.setResumeStatus(VerificationStatus.PENDING);
        student.setResumeUploadDate(LocalDateTime.now());
        student.setResumeRejectionReason(null);
        student = studentDAO.save(student);
        return Optional.of(student);
    }

    public Optional<Student> getStudentById(Long studentId) {
        return studentDAO.findById(studentId);
    }

    public List<Student> getAllStudentsWithCVs(String sortBy, String sortOrder, String status) {
        List<Student> students = studentDAO.findAll().stream()
            .filter(student -> student.getResumeStatus() != VerificationStatus.NONE)
            .toList();

        // Filtrage par statut
        if (status != null && !status.trim().isEmpty()) {
            try {
                VerificationStatus statusFilter = VerificationStatus.valueOf(status.toUpperCase());
                students = students.stream()
                    .filter(student -> student.getResumeStatus() == statusFilter)
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
                            if (s1.getResumeUploadDate() == null && s2.getResumeUploadDate() == null)
                                return 0;
                            if (s1.getResumeUploadDate() == null)
                                return ascending ? 1 : -1;
                            if (s2.getResumeUploadDate() == null)
                                return ascending ? -1 : 1;
                            return ascending ? s1.getResumeUploadDate().compareTo(s2.getResumeUploadDate())
                                : s2.getResumeUploadDate().compareTo(s1.getResumeUploadDate());
                        })
                        .toList();
                    break;
                case "status":
                case "statut":
                    students = students.stream()
                        .sorted((s1, s2) -> {
                            return ascending ? s1.getResumeStatus().name().compareTo(s2.getResumeStatus().name())
                                : s2.getResumeStatus().name().compareTo(s1.getResumeStatus().name());
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
}
