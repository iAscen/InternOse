package cal.ose.internose.presentation;

import cal.ose.internose.modele.Credentials;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.UserRole;
import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.security.Paths;
import cal.ose.internose.TestPaths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@ExtendWith(MockitoExtension.class)
@DisplayName("StudentController Tests")
public class StudentControllerTests {
    @Mock
    private StudentService studentService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    // utiliser un vrai object mapper pour serialiser les responses durant les tests
    @Spy
    private ObjectMapper objectMapper = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @InjectMocks
    private StudentController studentController;

    private MockMvc mockMvc;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(studentController).build();
    }

    private Student exampleStudent() {
        return Student.builder()
            .firstName("Artyom")
            .lastName("M.")
            .credentials(new Credentials("artyom@example.com", "password", UserRole.STUDENT))
            .build();
    }

    @Test
    @DisplayName("Test de la méthode uploadCV() (POST /api/student/cv)")
    public void testUploadCV() throws Exception {
        // Arrange
        Long studentID = 1L;
        Student student = exampleStudent();
        MockMultipartFile mockFile = new MockMultipartFile(
            "resumeFile", "CV_Exemple.pdf", "application/pdf", "Ceci est un fichier CV exemple".getBytes()
        );
        student.setResumeFileName(mockFile.getOriginalFilename());
        student.setResumeFileData(mockFile.getBytes());
        when(studentService.uploadResume(anyLong(), any(MultipartFile.class))).thenReturn(Optional.of(student));
        // Act
        MvcResult mvcResult = mockMvc.perform(
            multipart(Paths.STUDENT_RESUME_PATH)
                .file(mockFile)
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
        ).andReturn();
        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
    }

    @Test
    @DisplayName("Test de la méthode getCVStatus() (GET /api/student/resume)")
    public void testGetResumeStatus() throws Exception {
        // Arrange
        Long studentID = 1L;
        Student student = exampleStudent();
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        student.setResumeFileName("test.pdf");
        student.setResumeUploadDate(LocalDateTime.now());
        when(studentService.getStudentByID(studentID)).thenReturn(StudentDTO.fromEntity(student));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.STUDENT_RESUME_PATH)
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("PENDING");
    }

    @Test
    @DisplayName("Test de la méthode getCVStatus() avec étudiant non trouvé")
    public void testGetResumeStatus_StudentNotFound() throws Exception {
        // Arrange
        Long studentID = 999L;
        when(studentService.getStudentByID(studentID)).thenThrow(new NoSuchElementException("Student not found"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.STUDENT_RESUME_PATH)
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Student not found");
    }

    @Test
    @DisplayName("Test de la méthode getAllInternshipOffers() (GET /api/student/internship-offers)")
    public void testBrowseInternshipOffers() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();
        when(studentService.getAllApprovedInternshipOffers(studentId)).thenReturn(mockOffers);

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentInternshipOffersUrl(studentId))
                .param("studentID", studentId.toString())
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent2 = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent2).contains("Développeur Java");
        assertThat(responseContent2).contains("Analyste de données");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec filtres de base")
    public void testSearchInternshipOffers_WithBasicFilters() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();

        when(studentService.getAllApprovedInternshipOffers(studentId)).thenReturn(mockOffers);

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentSearchInternshipOffersUrl(studentId))
                .param("studentID", studentId.toString())
                .param("program", "Informatique")
                .param("location", "Montréal")
                .param("sortBy", "startDate")
                .param("sortOrder", "asc")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Développeur Java");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec filtres de salaire")
    public void testSearchInternshipOffers_WithSalaryFilters() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();

        when(studentService.getAllApprovedInternshipOffers(studentId)).thenReturn(mockOffers);

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentSearchInternshipOffersUrl(studentId))
                .param("studentID", studentId.toString())
                .param("minSalary", "500")
                .param("maxSalary", "1000")
                .param("sortBy", "salary")
                .param("sortOrder", "desc")
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Développeur Java");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec filtres de date")
    public void testSearchInternshipOffers_WithDateFilters() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();

        when(studentService.getAllApprovedInternshipOffers(studentId)).thenReturn(mockOffers);

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentSearchInternshipOffersUrl(studentId))
                .param("studentID", studentId.toString())
                .param("startDateFrom", "2024-06-01")
                .param("startDateTo", "2024-08-31")
                .param("sortBy", "startDate")
                .param("sortOrder", "asc")
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Développeur Java");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() sans paramètres")
    public void testSearchInternshipOffers_NoParameters() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();

        when(studentService.getAllApprovedInternshipOffers(studentId)).thenReturn(mockOffers);

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentSearchInternshipOffersUrl(studentId))
                .param("studentID", studentId.toString())
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Développeur Java");
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferDetails() avec offre trouvée")
    public void testGetInternshipOfferDetails_OfferFound() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        Long offerId = 1L;
        InternshipOfferDTO mockOffer = createTestOfferDTO();
        when(studentService.getInternshipOfferByID(offerId))
            .thenReturn(mockOffer);
        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentInternshipOfferDetailsUrl(offerId))
                .param("studentID", studentId.toString())
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Développeur Java");
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferDetails() avec offre non trouvée")
    public void testGetInternshipOfferDetails_OfferNotFound() throws Exception {
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        // Arrange
        Long offerId = 999L;
        when(studentService.getInternshipOfferByID(offerId)).thenThrow(new NoSuchElementException("Offre de stage non trouvée"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentInternshipOfferDetailsUrl(offerId))
                .param("studentID", studentId.toString())
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Offre de stage non trouvée");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec erreur de service")
    public void testSearchInternshipOffers_ServiceError() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        when(studentService.getAllApprovedInternshipOffers(studentId)).thenThrow(new RuntimeException("Erreur de base de données"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentSearchInternshipOffersUrl(studentId))
                .param("studentID", studentId.toString())
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Erreur de base de données");
    }

    @Test
    @DisplayName("Test de la méthode getAllInternshipOffers() avec erreur de service")
    public void testBrowseInternshipOffers_ServiceError() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);

        when(studentService.getAllApprovedInternshipOffers(studentId)).thenThrow(new RuntimeException("Erreur de base de données"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.buildStudentInternshipOffersUrl(studentId))
                .param("studentID", studentId.toString())
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Erreur de base de données");
    }

    private List<InternshipOfferDTO> createTestOfferDTOs() {
        InternshipOfferDTO offer1 = InternshipOfferDTO.builder()
            .id(1L)
            .title("Développeur Java")
            .program("Informatique")
            .address("Montréal, QC")
            .salary(750.0)
            .duration(12)
            .startDate(LocalDate.of(2024, 6, 1))
            .verificationStatus(VerificationStatus.APPROVED)
            .build();

        InternshipOfferDTO offer2 = InternshipOfferDTO.builder()
            .id(2L)
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

    private InternshipOfferDTO createTestOfferDTO() {
        return InternshipOfferDTO.builder()
            .id(1L)
            .title("Développeur Java")
            .program("Informatique")
            .address("Montréal, QC")
            .salary(750.0)
            .duration(12)
            .startDate(LocalDate.of(2024, 6, 1))
            .verificationStatus(VerificationStatus.APPROVED)
            .build();
    }

    @Test
    @DisplayName("Test de POST /api/student/internship-offers/{internshipOfferID}/respond - accepter offre")
    public void testRespondToApprovedOffer_Accept() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 1L;
        String requestBody = "{\"accepted\":true}";
        
        doNothing().when(studentService).respondToApprovedOffer(
            eq(studentID), 
            eq(internshipOfferID), 
            eq(true)
        );

        // Act
        MvcResult mvcResult = mockMvc.perform(
            post(TestPaths.buildStudentRespondToOfferUrl(internshipOfferID, studentID))
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseBody = mvcResult.getResponse().getContentAsString();
        assertThat(responseBody).contains("accepté cette offre de stage avec succès");
        verify(studentService, times(1)).respondToApprovedOffer(
            eq(studentID), 
            eq(internshipOfferID), 
            eq(true)
        );
    }

    @Test
    @DisplayName("Test de POST /api/student/internship-offers/{internshipOfferID}/respond - refuser offre")
    public void testRespondToApprovedOffer_Reject() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 1L;
        String requestBody = "{\"accepted\":false}";
        
        doNothing().when(studentService).respondToApprovedOffer(
            eq(studentID), 
            eq(internshipOfferID), 
            eq(false)
        );

        // Act
        MvcResult mvcResult = mockMvc.perform(
            post(TestPaths.buildStudentRespondToOfferUrl(internshipOfferID, studentID))
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseBody = mvcResult.getResponse().getContentAsString();
        assertThat(responseBody).contains("refusé cette offre de stage");
        verify(studentService, times(1)).respondToApprovedOffer(
            eq(studentID), 
            eq(internshipOfferID), 
            eq(false)
        );
    }

    @Test
    @DisplayName("Test de POST /api/student/internship-offers/{internshipOfferID}/respond - offre non trouvée")
    public void testRespondToApprovedOffer_NotFound() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 999L;
        String requestBody = "{\"accepted\":true}";
        
        doThrow(new NoSuchElementException("Vous n'avez pas postulé à cette offre de stage"))
            .when(studentService).respondToApprovedOffer(
                eq(studentID), 
                eq(internshipOfferID), 
                anyBoolean()
            );

        // Act
        MvcResult mvcResult = mockMvc.perform(
            post(TestPaths.buildStudentRespondToOfferUrl(internshipOfferID, studentID))
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseBody = mvcResult.getResponse().getContentAsString();
        assertThat(responseBody).contains("Vous n'avez pas postulé à cette offre de stage");
    }

    @Test
    @DisplayName("Test de POST /api/student/internship-offers/{internshipOfferID}/respond - offre expirée")
    public void testRespondToApprovedOffer_Expired() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 1L;
        String requestBody = "{\"accepted\":true}";
        
        doThrow(new Exception("Cette offre de stage a expiré, vous ne pouvez plus y répondre"))
            .when(studentService).respondToApprovedOffer(
                eq(studentID), 
                eq(internshipOfferID), 
                anyBoolean()
            );

        // Act
        MvcResult mvcResult = mockMvc.perform(
            post(TestPaths.buildStudentRespondToOfferUrl(internshipOfferID, studentID))
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseBody = mvcResult.getResponse().getContentAsString();
        assertThat(responseBody).contains("expiré");
    }
    
    @Test
    @DisplayName("POST /api/student/internship-offers/{internshipOfferID}/contract/sign - succès")
    public void signInternshipContract_Success() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 10L;
        InternshipContractDTO signedContract = new InternshipContractDTO();
        signedContract.setId(123L);
        signedContract.setIsSignedStudent(true);

        when(studentService.signContract(studentID, internshipOfferID)).thenReturn(signedContract);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.STUDENT_SIGN_CONTRACT_PATH.replace("{internshipOfferID}", String.valueOf(internshipOfferID)))
                    .param("studentID", String.valueOf(studentID))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        InternshipContractDTO result = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            InternshipContractDTO.class
        );
        assertThat(result.getId()).isEqualTo(123L);
        assertThat(result.getIsSignedStudent()).isTrue();
    }

    @Test
    @DisplayName("POST /api/student/internship-offers/{internshipOfferID}/contract/sign - contrat non trouvé")
    public void signInternshipContract_NotFound() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 999L;
        when(studentService.signContract(studentID, internshipOfferID))
            .thenThrow(new NoSuchElementException("Contrat non trouvé pour cet étudiant et cette offre"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.STUDENT_SIGN_CONTRACT_PATH.replace("{internshipOfferID}", String.valueOf(internshipOfferID)))
                    .param("studentID", String.valueOf(studentID))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Contrat non trouvé");
    }

    @Test
    @DisplayName("POST /api/student/internship-offers/{internshipOfferID}/contract/sign - contrat déjà signé par l'étudiant")
    public void signInternshipContract_AlreadySigned() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 10L;
        when(studentService.signContract(studentID, internshipOfferID))
            .thenThrow(new IllegalStateException("Ce contrat a déjà été signé par l'étudiant"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.STUDENT_SIGN_CONTRACT_PATH.replace("{internshipOfferID}", String.valueOf(internshipOfferID)))
                    .param("studentID", String.valueOf(studentID))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("déjà été signé");
    }

    @Test
    @DisplayName("POST /api/student/internship-offers/{internshipOfferID}/contract/sign - erreur de requête")
    public void signInternshipContract_BadRequest() throws Exception {
        // Arrange
        Long studentID = 1L;
        Long internshipOfferID = 10L;
        when(studentService.signContract(studentID, internshipOfferID))
            .thenThrow(new RuntimeException("Erreur lors de la signature"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.STUDENT_SIGN_CONTRACT_PATH.replace("{internshipOfferID}", String.valueOf(internshipOfferID)))
                    .param("studentID", String.valueOf(studentID))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Erreur lors de la signature");
    }
    
}
