package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InternshipOfferSearchCriteria;
import cal.ose.internose.service.exceptions.DocumentNotValidatedException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
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

    // ========== TESTS POUR LES MÉTHODES D'OFFRES DE STAGE ==========

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec critères de base")
    public void testSearchInternshipOffers_WithBasicCriteria() {
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        // Arrange
        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                .program("Informatique")
                .location("Montréal")
                .sortBy("startDate")
                .sortOrder("asc")
                .page(0)
                .size(10)
                .build();

        List<InternshipOffer> mockOffers = createTestOffers();
        Page<InternshipOffer> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 10), 2);
        
        when(internshipOfferDAO.findInternshipOffersWithoutDates(
                eq(DocumentStatus.APPROVED),
                eq("%Informatique%"),
                eq("%Montréal%"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(mockPage);

        // Act
        Page<InternshipOfferDTO> result = studentService.searchInternshipOffers(criteria, studentId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent().size()).isEqualTo(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        verify(internshipOfferDAO, times(1)).findInternshipOffersWithoutDates(
                eq(DocumentStatus.APPROVED),
                eq("%Informatique%"),
                eq("%Montréal%"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        );
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferById() avec offre trouvée")
    public void testGetInternshipOfferById_OfferFound() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        Long offerId = 1L;
        InternshipOffer mockOffer = createTestOffer();
        when(internshipOfferDAO.findByIdAndStatus(offerId, DocumentStatus.APPROVED))
                .thenReturn(mockOffer);

        // Act
        Optional<InternshipOfferDTO> result = studentService.getInternshipOfferById(offerId, studentId );

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(offerId);
        assertThat(result.get().getJobTitle()).isEqualTo("Développeur Java");
        verify(internshipOfferDAO, times(1)).findByIdAndStatus(offerId, DocumentStatus.APPROVED);
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferById() avec offre non trouvée")
    public void testGetInternshipOfferById_OfferNotFound() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        Long offerId = 999L;
        when(internshipOfferDAO.findByIdAndStatus(offerId, DocumentStatus.APPROVED))
                .thenReturn(null);

        // Act
        Optional<InternshipOfferDTO> result = studentService.getInternshipOfferById(offerId, studentId);

        // Assert
        assertThat(result).isEmpty();
        verify(internshipOfferDAO, times(1)).findByIdAndStatus(offerId, DocumentStatus.APPROVED);
    }

    @Test
    @DisplayName("Test de la méthode getAllApprovedInternshipOffers()")
    public void testGetAllApprovedInternshipOffers() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        List<InternshipOffer> mockOffers = createTestOffers();
        when(internshipOfferDAO.findAll()).thenReturn(mockOffers);

        // Act
        List<InternshipOfferDTO> result = studentService.getAllApprovedInternshipOffers(studentId);

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getJobTitle()).isEqualTo("Développeur Java");
        assertThat(result.get(1).getJobTitle()).isEqualTo("Analyste de données");
        verify(internshipOfferDAO, times(1)).findAll();
    }

    @Test
    @DisplayName("Test de la méthode countInternshipOffers()")
    public void testCountInternshipOffers() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                .program("Informatique")
                .build();

        when(internshipOfferDAO.countInternshipOffersWithoutDates(
                eq(DocumentStatus.APPROVED),
                eq("%Informatique%"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull()
        )).thenReturn(5L);

        // Act
        long result = studentService.countInternshipOffers(criteria, studentId);

        // Assert
        assertThat(result).isEqualTo(5L);
        verify(internshipOfferDAO, times(1)).countInternshipOffersWithoutDates(
                eq(DocumentStatus.APPROVED),
                eq("%Informatique%"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull()
        );
    }

    @Test
    @DisplayName("Test de la méthode getAllApprovedInternshipOffers() avec CV non validé")
    public void testViewInternshipOffersCvNotValidated() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        // Act & Assert
        assertThatThrownBy(() -> studentService.getAllApprovedInternshipOffers(studentId))
            .isInstanceOf(DocumentNotValidatedException.class)
            .hasMessage("Le CV n'est pas valide");

        verify(internshipOfferDAO, never()).findAll();
    }

    @Test
    @DisplayName("Test de la méthode countInternshipOffers() avec CV non validé")
    public void testCountInternshipOffersCvNotValidated() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.REJECTED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
            .program("Informatique")
            .build();

        // Act & Assert
        assertThatThrownBy(() -> studentService.countInternshipOffers(criteria, studentId))
            .isInstanceOf(DocumentNotValidatedException.class)
            .hasMessage("Le CV n'est pas valide");

        verify(internshipOfferDAO, never()).countInternshipOffersWithoutDates(any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferById() avec CV non validé")
    public void testGetInternshipOfferByIdCvNotValidated() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        Long offerId = 1L;

        // Act & Assert
        assertThatThrownBy(() -> studentService.getInternshipOfferById(offerId, studentId))
            .isInstanceOf(DocumentNotValidatedException.class)
            .hasMessage("Le CV n'est pas valide");

        verify(internshipOfferDAO, never()).findByIdAndStatus(any(), any());
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec CV non validé")
    public void testSearchInternshipOffersCvNotValidated() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.NONE);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
            .program("Informatique")
            .location("Montréal")
            .build();

        // Act & Assert
        assertThatThrownBy(() -> studentService.searchInternshipOffers(criteria, studentId))
            .isInstanceOf(DocumentNotValidatedException.class)
            .hasMessage("Le CV n'est pas valide");

        // Verify that the DAO method was not called since validation failed
        verify(internshipOfferDAO, never()).findInternshipOffersWithoutDates(any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }




    // ========== MÉTHODES UTILITAIRES POUR LES OFFRES DE STAGE ==========

    private List<InternshipOffer> createTestOffers() {
        Employer employer1 = Employer.builder()
                .enterprise("TechCorp")
                .build();
        employer1.setId(1L);

        Employer employer2 = Employer.builder()
                .enterprise("DataSoft")
                .build();
        employer2.setId(2L);

        InternshipOffer offer1 = InternshipOffer.builder()
                .id(1L)
                .employer(employer1)
                .jobTitle("Développeur Java")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(750.0)
                .duration(12)
                .startDate(LocalDate.of(2024, 6, 1))
                .validationStatus(DocumentStatus.APPROVED)
                .build();

        InternshipOffer offer2 = InternshipOffer.builder()
                .id(2L)
                .employer(employer2)
                .jobTitle("Analyste de données")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(650.0)
                .duration(16)
                .startDate(LocalDate.of(2024, 7, 1))
                .validationStatus(DocumentStatus.APPROVED)
                .build();

        return List.of(offer1, offer2);
    }

    private InternshipOffer createTestOffer() {
        Employer employer = Employer.builder()
                .enterprise("TechCorp")
                .build();
        employer.setId(1L);

        return InternshipOffer.builder()
                .id(1L)
                .employer(employer)
                .jobTitle("Développeur Java")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(750.0)
                .duration(12)
                .startDate(LocalDate.of(2024, 6, 1))
                .validationStatus(DocumentStatus.APPROVED)
                .build();
    }
}
