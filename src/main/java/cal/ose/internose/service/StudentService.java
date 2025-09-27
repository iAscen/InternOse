package cal.ose.internose.service;

import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.StudentDAO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
        student = studentDAO.save(student);
        return Optional.of(student);
    }
}
