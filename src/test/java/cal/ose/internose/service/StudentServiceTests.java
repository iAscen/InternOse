package cal.ose.internose.service;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.service.DTOs.StudentDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StudentService Tests")
public class StudentServiceTests {
    @Mock
    private StudentDAO studentDAO;

    @InjectMocks
    private StudentService studentService;

    @Test
    @DisplayName("Test de la méthode uploadCV()")
    public void testUploadResume() throws IOException {
        // Arrange
        Long studentID = 1L;
        Student student = exampleStudent();
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "CV_Exemple.pdf", "application/pdf", "Ceci est un fichier CV exemple".getBytes());
        student.setResumeFileName(mockFile.getOriginalFilename());
        student.setResumeFileType(mockFile.getContentType());
        student.setResumeFileData(mockFile.getBytes());
        when(studentDAO.findById(studentID)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);
        // Act
        Optional<Student> studentWithCV = studentService.uploadResume(studentID, mockFile);
        // Assert
        assertThat(studentWithCV).isPresent();
        assertThat(studentWithCV.get().getResumeFileName()).isEqualTo(mockFile.getOriginalFilename());
        assertThat(studentWithCV.get().getResumeFileType()).isEqualTo(mockFile.getContentType());
        assertThat(studentWithCV.get().getResumeFileData()).isEqualTo(mockFile.getBytes());
        verify(studentDAO, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec tri par nom")
    public void testGetAllStudentsWithResumes_SortByName() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<StudentDTO> result = studentService.getAllStudentsWithResumes("name", "asc", null);

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("Alice");
        assertThat(result.get(1).getFirstName()).isEqualTo("Bob");
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec tri par date")
    public void testGetAllStudentsWithResumes_SortByDate() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<StudentDTO> result = studentService.getAllStudentsWithResumes("date", "desc", null);

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("Bob");
        assertThat(result.get(1).getFirstName()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec filtrage par statut")
    public void testGetAllStudentsWithResumes_FilterByStatus() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<StudentDTO> result = studentService.getAllStudentsWithResumes(null, null, "PENDING");

        // Assert
        assertThat(result.size()).isEqualTo(1);
        assertThat(result.get(0).getResumeVerificationStatus()).isEqualTo(VerificationStatus.PENDING);
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec filtrage par statut invalide")
    public void testGetAllStudentsWithResumes_FilterByInvalidStatus() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<StudentDTO> result = studentService.getAllStudentsWithResumes(null, null, "INVALID_STATUS");

        // Assert - Devrait retourner tous les CV car le statut invalide est ignoré
        assertThat(result.size()).isEqualTo(2);
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec paramètres vides")
    public void testGetAllStudentsWithResumes_EmptyParameters() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<StudentDTO> result = studentService.getAllStudentsWithResumes("", "", "");

        // Assert - Devrait retourner tous les CV triés par nom par défaut
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec tri par statut")
    public void testGetAllStudentsWithResumes_SortByStatus() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<StudentDTO> result = studentService.getAllStudentsWithResumes("status", "asc", null);

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getResumeVerificationStatus()).isEqualTo(VerificationStatus.APPROVED);
        assertThat(result.get(1).getResumeVerificationStatus()).isEqualTo(VerificationStatus.PENDING);
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec tri par email")
    public void testGetAllStudentsWithResumes_SortByEmail() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<StudentDTO> result = studentService.getAllStudentsWithResumes("email", "asc", null);

        // Assert - Le tri par email devrait fonctionner même avec des emails null
        assertThat(result.size()).isEqualTo(2);
        // Les étudiants avec des emails null devraient être triés en dernier
        assertThat(result.get(0).getFirstName()).isEqualTo("Alice");
        assertThat(result.get(1).getFirstName()).isEqualTo("Bob");
    }

    private Student exampleStudent() {
        return Student.builder()
                .firstName("Artyom")
                .lastName("M.")
                .build();
    }

    private List<Student> createTestStudents() {
        Student student1 = Student.builder()
                .firstName("Alice")
                .lastName("Johnson")
                .resumeVerificationStatus(VerificationStatus.APPROVED)
                .resumeUploadDate(LocalDateTime.now().minusDays(2))
                .build();
        student1.setId(1L);

        Student student2 = Student.builder()
                .firstName("Bob")
                .lastName("Smith")
                .resumeVerificationStatus(VerificationStatus.PENDING)
                .resumeUploadDate(LocalDateTime.now().minusDays(1))
                .build();
        student2.setId(2L);

        return List.of(student1, student2);
    }
}
