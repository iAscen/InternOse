package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.persistance.StudentDAO;
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

    @Mock
    private InternshipOfferDAO internshipOfferDAO;

    @Mock
    private StudentApplicationDAO studentApplicationDAO;

    @InjectMocks
    private StudentService studentService;

//    TODO REMOVE IF STILL UNNECESSARY
//    @InjectMocks
//    private EmployerService employerService;
//
//    @InjectMocks
//    private InternshipManagerService internshipManagerService;

    @Test
    @DisplayName("Test de la méthode uploadCV()")
    public void testUploadCV() throws IOException {
        // Arrange
        Long studentID = 1L;
        Student student = exampleStudent();
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "CV_Exemple.pdf", "application/pdf", "Ceci est un fichier CV exemple".getBytes());
        student.setCVFileName(mockFile.getOriginalFilename());
        student.setCVFileType(mockFile.getContentType());
        student.setCVFileData(mockFile.getBytes());
        when(studentDAO.findById(studentID)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);
        // Act
        Optional<Student> studentWithCV = studentService.uploadCV(studentID, mockFile);
        // Assert
        assertThat(studentWithCV).isPresent();
        assertThat(studentWithCV.get().getCVFileName()).isEqualTo(mockFile.getOriginalFilename());
        assertThat(studentWithCV.get().getCVFileType()).isEqualTo(mockFile.getContentType());
        assertThat(studentWithCV.get().getCVFileData()).isEqualTo(mockFile.getBytes());
        verify(studentDAO, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec tri par nom")
    public void testGetAllStudentsWithCVs_SortByName() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<Student> result = studentService.getAllStudentsWithCVs("name", "asc", null);

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("Alice");
        assertThat(result.get(1).getFirstName()).isEqualTo("Bob");
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec tri par date")
    public void testGetAllStudentsWithCVs_SortByDate() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<Student> result = studentService.getAllStudentsWithCVs("date", "desc", null);

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("Bob");
        assertThat(result.get(1).getFirstName()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec filtrage par statut")
    public void testGetAllStudentsWithCVs_FilterByStatus() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<Student> result = studentService.getAllStudentsWithCVs(null, null, "PENDING");

        // Assert
        assertThat(result.size()).isEqualTo(1);
        assertThat(result.get(0).getCvStatus()).isEqualTo(DocumentStatus.PENDING);
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec filtrage par statut invalide")
    public void testGetAllStudentsWithCVs_FilterByInvalidStatus() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<Student> result = studentService.getAllStudentsWithCVs(null, null, "INVALID_STATUS");

        // Assert - Devrait retourner tous les CV car le statut invalide est ignoré
        assertThat(result.size()).isEqualTo(2);
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec paramètres vides")
    public void testGetAllStudentsWithCVs_EmptyParameters() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<Student> result = studentService.getAllStudentsWithCVs("", "", "");

        // Assert - Devrait retourner tous les CV triés par nom par défaut
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getFirstName()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec tri par statut")
    public void testGetAllStudentsWithCVs_SortByStatus() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<Student> result = studentService.getAllStudentsWithCVs("status", "asc", null);

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getCvStatus()).isEqualTo(DocumentStatus.APPROVED);
        assertThat(result.get(1).getCvStatus()).isEqualTo(DocumentStatus.PENDING);
    }

    @Test
    @DisplayName("Test de la méthode getAllStudentsWithCVs() avec tri par email")
    public void testGetAllStudentsWithCVs_SortByEmail() {
        // Arrange
        List<Student> students = createTestStudents();
        when(studentDAO.findAll()).thenReturn(students);

        // Act
        List<Student> result = studentService.getAllStudentsWithCVs("email", "asc", null);

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
                .cvStatus(DocumentStatus.APPROVED)
                .cvUploadedAt(LocalDateTime.now().minusDays(2))
                .build();
        student1.setId(1L);

        Student student2 = Student.builder()
                .firstName("Bob")
                .lastName("Smith")
                .cvStatus(DocumentStatus.PENDING)
                .cvUploadedAt(LocalDateTime.now().minusDays(1))
                .build();
        student2.setId(2L);

        return List.of(student1, student2);
    }
//
//    @Test
//    @DisplayName("Test de la méthode validateStudentCV() - Approbation")
//    public void testValidateStudentCV_Approve() {
//        // Arrange
//        Long studentId = 1L;
//        Student student = createTestStudents().get(0);
//        student.setCvStatus(DocumentStatus.PENDING);
//        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
//        when(studentDAO.save(any(Student.class))).thenReturn(student);
//
//        // Act
//        internshipManagerService.validateStudentCV(studentId, true, null);
//
//        // Assert
//        assertThat(student.getCvStatus()).isEqualTo(DocumentStatus.APPROVED);
//        assertThat(student.getCvValidatedAt()).isNotNull();
//        assertThat(student.getCvRejectionReason()).isNull();
//        verify(studentDAO, times(1)).save(student);
//    }
//
//    @Test
//    @DisplayName("Test de la méthode validateStudentCV() - Refus")
//    public void testValidateStudentCV_Reject() {
//        // Arrange
//        Long studentId = 1L;
//        String rejectionReason = "CV incomplet";
//        Student student = createTestStudents().get(0);
//        student.setCvStatus(DocumentStatus.PENDING);
//        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
//        when(studentDAO.save(any(Student.class))).thenReturn(student);
//
//        // Act
//        internshipManagerService.validateStudentCV(studentId, false, rejectionReason);
//
//        // Assert
//        assertThat(student.getCvStatus()).isEqualTo(DocumentStatus.REJECTED);
//        assertThat(student.getCvValidatedAt()).isNotNull();
//        assertThat(student.getCvRejectionReason()).isEqualTo(rejectionReason);
//        verify(studentDAO, times(1)).save(student);
//    }
//
//    @Test
//    @DisplayName("Test de la méthode validateStudentCV() - Étudiant non trouvé")
//    public void testValidateStudentCV_StudentNotFound() {
//        // Arrange
//        Long studentId = 999L;
//        when(studentDAO.findById(studentId)).thenReturn(Optional.empty());
//
//        // Act & Assert
//        try {
//            internshipManagerService.validateStudentCV(studentId, true, null);
//            assertThat(false).isTrue(); // Ne devrait pas arriver ici
//        } catch (RuntimeException e) {
//            assertThat(e.getMessage()).isEqualTo("Étudiant non trouvé");
//        }
//    }
//
//    @Test
//    @DisplayName("Test de la méthode validateStudentCV() - CV déjà traité")
//    public void testValidateStudentCV_AlreadyProcessed() {
//        // Arrange
//        Long studentId = 1L;
//        Student student = createTestStudents().get(0);
//        student.setCvStatus(DocumentStatus.APPROVED); // Déjà traité
//        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
//
//        // Act & Assert
//        try {
//            internshipManagerService.validateStudentCV(studentId, true, null);
//            assertThat(false).isTrue(); // Ne devrait pas arriver ici
//        } catch (RuntimeException e) {
//            assertThat(e.getMessage()).isEqualTo("Ce CV a déjà été traité");
//        }
//    }
//
//    @Test
//    @DisplayName("Test de la méthode validateStudentCV() - Refus avec raison vide")
//    public void testValidateStudentCV_RejectWithEmptyReason() {
//        // Arrange
//        Long studentId = 1L;
//        Student student = createTestStudents().get(0);
//        student.setCvStatus(DocumentStatus.PENDING);
//        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
//        when(studentDAO.save(any(Student.class))).thenReturn(student);
//
//        // Act
//        internshipManagerService.validateStudentCV(studentId, false, "");
//
//        // Assert
//        assertThat(student.getCvStatus()).isEqualTo(DocumentStatus.REJECTED);
//        assertThat(student.getCvValidatedAt()).isNotNull();
//        assertThat(student.getCvRejectionReason()).isEqualTo("");
//        verify(studentDAO, times(1)).save(student);
//    }
//
//    @Test
//    @DisplayName("Test de la méthode validateStudentCV() - Approbation avec raison")
//    public void testValidateStudentCV_ApproveWithReason() {
//        // Arrange
//        Long studentId = 1L;
//        Student student = createTestStudents().get(0);
//        student.setCvStatus(DocumentStatus.PENDING);
//        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
//        when(studentDAO.save(any(Student.class))).thenReturn(student);
//
//        // Act
//        internshipManagerService.validateStudentCV(studentId, true, "CV excellent");
//
//        // Assert
//        assertThat(student.getCvStatus()).isEqualTo(DocumentStatus.APPROVED);
//        assertThat(student.getCvValidatedAt()).isNotNull();
//        assertThat(student.getCvRejectionReason()).isNull(); // Doit être null pour approbation
//        verify(studentDAO, times(1)).save(student);
//    }

    @Test
    public void testPostulerSuccess() {
        Long studentId = 1L;
        Student student = exampleStudent();
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        Long internshipOfferId = 1L;
        when(internshipOfferDAO.findById(internshipOfferId)).thenReturn(Optional.of(new InternshipOffer()));


        studentService.applyToInternship(studentId, internshipOfferId);


        verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
    }

    @Test
    public void testCvMissingValidation() {

    }

    @Test
    public void testAlreadyPostule() {

    }

    @Test
    public void testInvalidOfferId() {

    }
}
