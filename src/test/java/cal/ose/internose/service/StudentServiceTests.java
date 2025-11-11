package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("StudentService Tests")
public class StudentServiceTests {
    @Mock
    private StudentDAO studentDAO;

    @Mock
    private InternshipOfferDAO internshipOfferDAO;

    @Mock
    private StudentApplicationDAO studentApplicationDAO;

    @Mock
    private InternshipContractDAO internshipContractDAO;
 
    @InjectMocks
    private StudentService studentService;

    @BeforeEach
    void setUp() {
        reset(studentDAO);
        reset(internshipOfferDAO);
        reset(studentApplicationDAO);
        reset(internshipContractDAO);
        // Clear any previous interactions
        clearInvocations(studentDAO);
        clearInvocations(internshipOfferDAO);
        clearInvocations(internshipContractDAO);
    }

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
        List<StudentDTO> result = studentService.getAllStudentsWithResumes("upload_date", "desc", null);

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
        Credentials credentials = Credentials.builder()
                .email("artyom@example.com")
                .password("password123")
                .build();

        return Student.builder()
                .firstName("Artyom")
                .lastName("M.")
                .credentials(credentials)
                .build();
    }

    private List<Student> createTestStudents() {
        Credentials credentials1 = Credentials.builder()
                .email("alice.johnson@example.com")
                .password("password123")
                .build();

        Credentials credentials2 = Credentials.builder()
                .email("bob.smith@example.com")
                .password("password123")
                .build();

        Student student1 = Student.builder()
                .firstName("Alice")
                .lastName("Johnson")
                .credentials(credentials1)
                .resumeVerificationStatus(VerificationStatus.APPROVED)
                .resumeUploadDate(LocalDateTime.now().minusDays(2))
                .build();
        student1.setId(1L);

        Student student2 = Student.builder()
                .firstName("Bob")
                .lastName("Smith")
                .credentials(credentials2)
                .resumeVerificationStatus(VerificationStatus.PENDING)
                .resumeUploadDate(LocalDateTime.now().minusDays(1))
                .build();
        student2.setId(2L);

        return List.of(student1, student2);
    }

    // ========== TESTS POUR LES MÉTHODES D'OFFRES DE STAGE ==========

    @Test
    @DisplayName("Test de la méthode getInternshipOfferById() avec offre trouvée")
    public void testGetInternshipOfferById_OfferFound() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        Long internshipOfferID = 1L;
        InternshipOffer mockOffer = createTestOffer();
        when(internshipOfferDAO.findById(internshipOfferID))
                .thenReturn(Optional.of(mockOffer));

        // Act
        Optional<InternshipOfferDTO> result = Optional
                .ofNullable(studentService.getInternshipOfferByID(internshipOfferID));

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(internshipOfferID);
        assertThat(result.get().getTitle()).isEqualTo("Développeur Java");
        verify(internshipOfferDAO, times(1)).findById(internshipOfferID);
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferById() avec offre non trouvée")
    public void testGetInternshipOfferById_OfferNotFound() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        Long offerId = 999L;
        when(internshipOfferDAO.findById(offerId)).thenReturn(Optional.empty());

        // Act & Assert: expect NoSuchElementException from orElseThrow()
        org.junit.jupiter.api.Assertions.assertThrows(
                java.util.NoSuchElementException.class,
                () -> studentService.getInternshipOfferByID(offerId));

        verify(internshipOfferDAO, times(1)).findById(offerId);
    }

    @Test
    @DisplayName("Test de la méthode getAllApprovedInternshipOffers()")
    public void testGetAllApprovedInternshipOffers() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        List<InternshipOffer> mockOffers = createTestOffers();
        when(internshipOfferDAO.findAll()).thenReturn(mockOffers);

        // Mock des candidatures - aucune candidature pour ces offres
        when(studentApplicationDAO.findByStudentAndInternshipOffer(any(Student.class), any(InternshipOffer.class)))
                .thenReturn(Optional.empty());

        // Act
        List<InternshipOfferDTO> result = studentService.getAllApprovedInternshipOffers(studentId);

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Développeur Java");
        assertThat(result.get(1).getTitle()).isEqualTo("Analyste de données");
        assertThat(result.get(0).getApplicationStatus()).isNull(); // Pas de candidature
        assertThat(result.get(1).getApplicationStatus()).isNull(); // Pas de candidature
        verify(internshipOfferDAO, times(1)).findAll();
    }

    @Test
    @DisplayName("Test de la méthode getAllApprovedInternshipOffers() avec CV non validé - maintenant autorisé")
    public void testViewInternshipOffersCvNotValidated() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        // Mock the DAO method
        when(internshipOfferDAO.findAll()).thenReturn(createTestOffers());

        // Mock des candidatures - aucune candidature pour ces offres
        when(studentApplicationDAO.findByStudentAndInternshipOffer(any(Student.class), any(InternshipOffer.class)))
                .thenReturn(Optional.empty());

        // Act - should not throw exception anymore
        List<InternshipOfferDTO> result = studentService.getAllApprovedInternshipOffers(studentId);

        // Assert
        assertThat(result).isNotNull();
        verify(internshipOfferDAO).findAll();
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferById() avec CV non validé - maintenant autorisé")
    public void testGetInternshipOfferByIdCvNotValidated() {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        Long internshipOfferID = 1L;
        InternshipOffer mockOffer = InternshipOffer.builder()
                .id(internshipOfferID)
                .title("Test Offer")
                .verificationStatus(VerificationStatus.APPROVED)
                .build();
        when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(mockOffer));

        // Act - should not throw exception anymore
        Optional<InternshipOfferDTO> result = Optional
                .ofNullable(studentService.getInternshipOfferByID(internshipOfferID));

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Test Offer");
        verify(internshipOfferDAO).findById(internshipOfferID);
    }

    // ========== MÉTHODES UTILITAIRES POUR LES OFFRES DE STAGE ==========

    private List<InternshipOffer> createTestOffers() {
        Employer employer1 = Employer.builder()
                .company("TechCorp")
                .build();
        employer1.setId(1L);

        Employer employer2 = Employer.builder()
                .company("DataSoft")
                .build();
        employer2.setId(2L);

        InternshipOffer offer1 = InternshipOffer.builder()
                .id(1L)
                .employer(employer1)
                .title("Développeur Java")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(750.0)
                .duration(12)
                .startDate(LocalDate.of(2024, 6, 1))
                .verificationStatus(VerificationStatus.APPROVED)
                .build();

        InternshipOffer offer2 = InternshipOffer.builder()
                .id(2L)
                .employer(employer2)
                .title("Analyste de données")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(650.0)
                .duration(16)
                .startDate(LocalDate.of(2024, 7, 1))
                .verificationStatus(VerificationStatus.APPROVED)
                .build();

        return List.of(offer1, offer2);
    }

    private InternshipOffer createTestOffer() {
        Employer employer = Employer.builder()
                .company("TechCorp")
                .build();
        employer.setId(1L);

        return InternshipOffer.builder()
                .id(1L)
                .employer(employer)
                .title("Développeur Java")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(750.0)
                .duration(12)
                .startDate(LocalDate.of(2024, 6, 1))
                .expirationDate(LocalDate.now().plusDays(10))
                .verificationStatus(VerificationStatus.APPROVED)
                .build();
    }

    @Test
    @DisplayName("Test de la méthode respondToApprovedOffer() - accepter offre")
    public void testRespondToApprovedOffer_Accept() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 1L;

        Student student = exampleStudent();
        student.setId(studentID);

        InternshipOffer internshipOffer = createTestOffer();
        internshipOffer.setId(internshipOfferID);
        internshipOffer.setEndDate(LocalDate.now().plusDays(30)); // Offre valide

        StudentApplication application = StudentApplication.builder()
                .id(1L)
                .student(student)
                .internshipOffer(internshipOffer)
                .applicationStatus(StudentApplication.ApplicationStatus.APPROVED)
                .build();

        when(studentDAO.findById(studentID)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
        when(studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer))
                .thenReturn(Optional.of(application));
        when(studentApplicationDAO.save(any(StudentApplication.class))).thenReturn(application);

        // Act
        studentService.respondToApprovedOffer(studentID, internshipOfferID, true);

        // Assert
        verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
        assertThat(application.getApplicationStatus())
                .isEqualTo(StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT);
    }

    @Test
    @DisplayName("Test de la méthode respondToApprovedOffer() - refuser offre")
    public void testRespondToApprovedOffer_Reject() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 1L;

        Student student = exampleStudent();
        student.setId(studentID);

        InternshipOffer internshipOffer = createTestOffer();
        internshipOffer.setId(internshipOfferID);
        internshipOffer.setEndDate(LocalDate.now().plusDays(30)); // Offre valide

        StudentApplication application = StudentApplication.builder()
                .id(1L)
                .student(student)
                .internshipOffer(internshipOffer)
                .applicationStatus(StudentApplication.ApplicationStatus.APPROVED)
                .build();

        when(studentDAO.findById(studentID)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
        when(studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer))
                .thenReturn(Optional.of(application));
        when(studentApplicationDAO.save(any(StudentApplication.class))).thenReturn(application);

        // Act
        studentService.respondToApprovedOffer(studentID, internshipOfferID, false);

        // Assert
        verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
        assertThat(application.getApplicationStatus())
                .isEqualTo(StudentApplication.ApplicationStatus.REJECTED_BY_STUDENT);
    }

    @Test
    @DisplayName("Test de la méthode respondToApprovedOffer() - candidature non trouvée")
    public void testRespondToApprovedOffer_ApplicationNotFound() {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 1L;

        Student student = exampleStudent();
        student.setId(studentID);

        InternshipOffer internshipOffer = createTestOffer();
        internshipOffer.setId(internshipOfferID);

        when(studentDAO.findById(studentID)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
        when(studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                NoSuchElementException.class,
                () -> studentService.respondToApprovedOffer(studentID, internshipOfferID, true));
        verify(studentApplicationDAO, never()).save(any(StudentApplication.class));
    }

    @Test
    @DisplayName("Test de la méthode respondToApprovedOffer() - statut non APPROVED")
    public void testRespondToApprovedOffer_NotApprovedStatus() {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 1L;

        Student student = exampleStudent();
        student.setId(studentID);

        InternshipOffer internshipOffer = createTestOffer();
        internshipOffer.setId(internshipOfferID);

        StudentApplication application = StudentApplication.builder()
                .id(1L)
                .student(student)
                .internshipOffer(internshipOffer)
                .applicationStatus(StudentApplication.ApplicationStatus.PENDING) // Pas APPROVED
                .build();

        when(studentDAO.findById(studentID)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
        when(studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer))
                .thenReturn(Optional.of(application));

        // Act & Assert
        assertThrows(
                Exception.class,
                () -> studentService.respondToApprovedOffer(studentID, internshipOfferID, true));
        verify(studentApplicationDAO, never()).save(any(StudentApplication.class));
    }

    @Test
    @DisplayName("Test de la méthode respondToApprovedOffer() - offre expirée")
    public void testRespondToApprovedOffer_ExpiredOffer() {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 1L;

        Student student = exampleStudent();
        student.setId(studentID);

        InternshipOffer internshipOffer = createTestOffer();
        internshipOffer.setExpirationDate(LocalDate.now().minusDays(1));
        internshipOffer.setId(internshipOfferID);
        internshipOffer.setEndDate(LocalDate.now().minusDays(1)); // Offre expirée

        StudentApplication application = StudentApplication.builder()
                .id(1L)
                .student(student)
                .internshipOffer(internshipOffer)
                .applicationStatus(StudentApplication.ApplicationStatus.APPROVED)
                .build();

        when(studentDAO.findById(studentID)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
        when(studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer))
                .thenReturn(Optional.of(application));

        // Act & Assert
        assertThrows(
                Exception.class,
                () -> studentService.respondToApprovedOffer(studentID, internshipOfferID, true));
        verify(studentApplicationDAO, never()).save(any(StudentApplication.class));
    }

    // ========== TESTS POUR signContract() DE StudentService ==========

    @Test
    @DisplayName("Test de la méthode signContract() - Exécution normale (étudiant signe)")
    void testStudentSignContract_NormalExecution() {
        // Arrange
        Long studentId = 1L;
        Long offerId = 10L;

        Student student = exampleStudent();
        student.setId(studentId);

        InternshipOffer offer = createTestOffer();
        offer.setId(offerId);

        InternshipContract contract = InternshipContract.builder()
                .id(100L)
                .student(student)
                .internshipOffer(offer)
                .isSignedStudent(false)
                .isSignedEmployer(true)
                .isSignedInternshipManager(true)
                .build();

        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(offerId)).thenReturn(Optional.of(offer));
        when(internshipContractDAO.findByStudentAndInternshipOffer(student, offer)).thenReturn(Optional.of(contract));
        when(internshipContractDAO.save(any(InternshipContract.class))).thenReturn(contract);

        // Act
        InternshipContractDTO result = studentService.signContract(studentId, offerId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getIsSignedStudent()).isTrue();
        verify(studentDAO, times(1)).findById(studentId);
        verify(internshipOfferDAO, times(1)).findById(offerId);
        verify(internshipContractDAO, times(1)).findByStudentAndInternshipOffer(student, offer);
        verify(internshipContractDAO, times(1)).save(contract);
    }

    @Test
    @DisplayName("Test de la méthode signContract() - Contrat non trouvé pour l'étudiant et l'offre")
    void testStudentSignContract_ContractNotFound() {
        // Arrange
        Long studentId = 1L;
        Long offerId = 10L;

        Student student = exampleStudent();
        student.setId(studentId);
        InternshipOffer offer = createTestOffer();
        offer.setId(offerId);

        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(offerId)).thenReturn(Optional.of(offer));
        when(internshipContractDAO.findByStudentAndInternshipOffer(student, offer)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NoSuchElementException.class, () -> studentService.signContract(studentId, offerId));
        verify(internshipContractDAO, never()).save(any());
    }

    @Test
    @DisplayName("Test de la méthode signContract() - Contrat déjà signé par l'étudiant")
    void testStudentSignContract_AlreadySigned() {
        // Arrange
        Long studentId = 1L;
        Long offerId = 10L;

        Student student = exampleStudent();
        student.setId(studentId);
        InternshipOffer offer = createTestOffer();
        offer.setId(offerId);

        InternshipContract contract = InternshipContract.builder()
                .id(100L)
                .student(student)
                .internshipOffer(offer)
                .isSignedStudent(true) // déjà signé par l'étudiant
                .build();

        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(offerId)).thenReturn(Optional.of(offer));
        when(internshipContractDAO.findByStudentAndInternshipOffer(student, offer)).thenReturn(Optional.of(contract));

        // Act & Assert
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> studentService.signContract(studentId, offerId));
        assertThat(ex.getMessage()).isEqualTo("Ce contrat a déjà été signé par l'étudiant");
        verify(internshipContractDAO, never()).save(any());
    }
    
}
