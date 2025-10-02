package cal.ose.internose.service;

import cal.ose.internose.modele.CVStatus;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.StudentDAO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentService {
    private final StudentDAO studentDAO;

    public StudentService(StudentDAO studentDAO) {
        this.studentDAO = studentDAO;
    }

    public Optional<Student> uploadCV(Long studentID, MultipartFile CVFile) throws IOException {
        Student student = studentDAO.findById(studentID).orElseThrow();
        student.setCVFileName(CVFile.getOriginalFilename());
        student.setCVFileType(CVFile.getContentType());
        student.setCVFileData(CVFile.getBytes());
        student.setCvStatus(CVStatus.PENDING);
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
                .filter(student -> student.getCvStatus() != CVStatus.NONE)
                .toList();
    }

    public void validateStudentCV(Long studentId, boolean approved, String reason) {
        Student student = studentDAO.findById(studentId).orElseThrow();
        
        if (approved) {
            student.setCvStatus(CVStatus.APPROVED);
            student.setCvValidatedAt(LocalDateTime.now());
            student.setCvRejectionReason(null);
        } else {
            student.setCvStatus(CVStatus.REJECTED);
            student.setCvRejectionReason(reason);
            student.setCvValidatedAt(LocalDateTime.now());
        }
        
        studentDAO.save(student);
    }
}
