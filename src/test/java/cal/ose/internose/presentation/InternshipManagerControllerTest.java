package cal.ose.internose.presentation;

import cal.ose.internose.TestPaths;
import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.ProfessorDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import cal.ose.internose.service.exceptions.InternshipOfferNotAcceptedByStudentException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(InternshipManagerController.class)
@AutoConfigureMockMvc(addFilters = false)
class InternshipManagerControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private InternshipManagerService internshipManagerService;
    @MockitoBean
    private StudentService studentService;
    @MockitoBean
    private InternshipOfferDAO internshipOfferDAO;

    @Test
    void getAllEmployersInternshipOffers() throws Exception {
        when(internshipManagerService.findInternshipsBy(
            null, "Informatique", null, null, null)).thenReturn(
            List.of(InternshipOfferDTO.builder().program("Informatique").build()));

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_OFFERS_PATH)
                    .param("program", "Informatique")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        List<InternshipOfferDTO> responseList = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipOfferDTO>>() {
            });

        assertThat(mvcResult.getResponse().getStatus())
            .isEqualTo(HttpStatus.OK.value());

        assertThat(responseList.getFirst().getProgram()).isEqualTo("Informatique");
    }

    @Test
    void getAllEmployersInternshipOffersWithFilters() throws Exception {
        // Test avec filtrage par domaine et statut
        when(internshipManagerService.findInternshipsBy(
            true, "Informatique", "Développeur", "Winter-2025", "title")).thenReturn(
            List.of(
                InternshipOfferDTO.builder().program("Informatique")
                    .title("Développeur Java")
                    .verificationStatus(
                        VerificationStatus.APPROVED)
                    .build(),
                InternshipOfferDTO.builder().program("Informatique")
                    .title("Développeur Python")
                    .verificationStatus(
                        VerificationStatus.APPROVED)
                    .build()));

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_OFFERS_PATH)
                    .param("program", "Informatique")
                    .param("isVerified", "true")
                    .param("title", "Développeur")
                    .param("sortBy", "title")
                    .param("session", "Winter-2025")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        List<InternshipOfferDTO> responseList = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipOfferDTO>>() {
            });

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(responseList.size()).isEqualTo(2);
        assertThat(responseList.getFirst().getTitle()).isEqualTo("Développeur Java");
    }

    @Test
    void getAllEmployersInternshipOffersWithSorting() throws Exception {
        // Test avec tri par statut
        when(internshipManagerService.findInternshipsBy(
            null, null, null, null, "status")).thenReturn(
            List.of(
                InternshipOfferDTO.builder().program("Informatique")
                    .verificationStatus(
                        VerificationStatus.APPROVED)
                    .build(),
                InternshipOfferDTO.builder().program("Biologie")
                    .verificationStatus(
                        VerificationStatus.APPROVED)
                    .build()));

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_OFFERS_PATH)
                    .param("sortBy", "status")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        List<InternshipOfferDTO> responseList = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipOfferDTO>>() {
            });

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(responseList.size()).isEqualTo(2);
    }

    @Test
    void getAllEmployersInternshipOffersEmptyResult() throws Exception {
        // Test avec aucun résultat
        when(internshipManagerService.findInternshipsBy(
            null, "NonExistent", null, null,null)).thenReturn(List.of());

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_OFFERS_PATH)
                    .param("program", "NonExistent")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        List<InternshipOfferDTO> responseList = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipOfferDTO>>() {
            });

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(responseList.size()).isEqualTo(0);
    }

    @Test
    void verifyInternshipOffer_Approve() throws Exception {
        // Test d'approbation d'une offre de stage
        Long internshipOfferID = 1L;
        Boolean isApproved = true;

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH)
                    .param("internshipOfferID", String.valueOf(internshipOfferID))
                    .param("isApproved", String.valueOf(isApproved))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    void verifyInternshipOffer_Reject() throws Exception {
        // Test de rejet d'une offre de stage
        Long internshipOfferID = 2L;
        Boolean isApproved = false;
        String comment = "Description insuffisante";

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH)
                    .param("internshipOfferID", String.valueOf(internshipOfferID))
                    .param("isApproved", String.valueOf(isApproved))
                    .param("comment", comment)
                    .contentType(MediaType.APPLICATION_JSON)
            )
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    void verifyInternshipOffer_ApproveWithoutComment() throws Exception {
        // Test d'approbation sans commentaire
        Long internshipOfferID = 3L;
        Boolean isApproved = true;

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH)
                    .param("internshipOfferID", String.valueOf(internshipOfferID))
                    .param("isApproved", String.valueOf(isApproved))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
//        assertThat(mvcResult.getResponse().getContentAsString()).contains("Offre de stage validée avec succès");
        System.out.println(mvcResult.getResponse().getContentAsString());
    }

    @Test
    void getAllStudentsResumes() throws Exception {
        // Test de base pour récupérer tous les CVs des étudiants
        when(studentService.getAllStudentsWithResumes(null, null, null))
            .thenReturn(createTestStudentDTOs());

        MvcResult mvcResult = mockMvc.perform(
                get(TestPaths.buildInternshipManagerStudentsCvsUrl())
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        // Controller returns a raw list of StudentDTOs. Check for student data instead of wrapper fields.
        assertThat(responseContent).contains("Alice");
        assertThat(responseContent).contains("Bob");
    }

    @Test
    void getAllStudentsResumesWithFilters() throws Exception {
        // Test avec filtrage par statut et tri
        when(studentService.getAllStudentsWithResumes("name", "asc", "PENDING"))
            .thenReturn(createTestStudentDTOs().stream()
                .filter(s -> s.getResumeVerificationStatus() == VerificationStatus.PENDING)
                .toList());

        MvcResult mvcResult = mockMvc.perform(
                get(TestPaths.buildInternshipManagerStudentsCvsUrl())
                    .param("sortBy", "name")
                    .param("sortOrder", "asc")
                    .param("status", "PENDING")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("PENDING");
    }

    @Test
    void getAllStudentsResumesWithSorting() throws Exception {
        // Test avec tri par date
        when(studentService.getAllStudentsWithResumes("date", "desc", null))
            .thenReturn(createTestStudentDTOs());

        MvcResult mvcResult = mockMvc.perform(
                get(TestPaths.buildInternshipManagerStudentsCvsUrl())
                    .param("sortBy", "date")
                    .param("sortOrder", "desc")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("APPROVED");
    }

    private List<Student> createTestStudents() {
        Student student1 = Student.builder()
            .firstName("Alice")
            .lastName("Smith")
            .credentials(new Credentials("alice@example.com", "password", UserRole.STUDENT))
            .resumeVerificationStatus(VerificationStatus.PENDING)
            .resumeUploadDate(LocalDateTime.now().minusDays(1))
            .build();
        student1.setId(1L);

        Student student2 = Student.builder()
            .firstName("Bob")
            .lastName("Johnson")
            .credentials(new Credentials("bob@example.com", "password", UserRole.STUDENT))
            .resumeVerificationStatus(VerificationStatus.APPROVED)
            .resumeUploadDate(LocalDateTime.now().minusDays(2))
            .build();
        student2.setId(2L);

        return List.of(student1, student2);
    }

    private List<StudentDTO> createTestStudentDTOs() {
        return createTestStudents().stream()
            .map(StudentDTO::fromEntity)
            .toList();
    }

    // ===== MES NOUVELLES MÉTHODES DE TEST POUR LA VALIDATION DES CVs =====

    @Test
    void getStudentResumeDetails_Success() throws Exception {
        // Test de récupération des détails d'un CV d'étudiant
        Student student = createTestStudents().getFirst();
        student.setResumeFileName("alice_cv.pdf");
        student.setResumeFileType("application/pdf");
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));

        MvcResult mvcResult = mockMvc.perform(
                get(TestPaths.buildInternshipManagerResumeUrl(1L))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("PENDING");
        assertThat(responseContent).contains("alice_cv.pdf");
    }

    @Test
    void getStudentCVDetails_StudentNotFound() throws Exception {
        // Test avec étudiant non trouvé
        when(studentService.getStudentByID(999L)).thenThrow(new RuntimeException("Student not found"));

        MvcResult mvcResult = mockMvc.perform(
                get(TestPaths.buildInternshipManagerResumeUrl(999L))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Student not found");
    }

    @Test
    void downloadStudentResume_Success() throws Exception {
        // Test de téléchargement d'un CV
        Student student = createTestStudents().get(0);
        student.setResumeFileData("test cv data".getBytes());
        student.setResumeFileName("test_cv.pdf");
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));

        MvcResult mvcResult = mockMvc.perform(
                get(TestPaths.buildInternshipManagerDownloadResumeUrl(1L))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    void downloadStudentCV_StudentNotFound() throws Exception {
        // Test de téléchargement avec étudiant non trouvé
        when(studentService.getStudentByID(999L)).thenThrow(new RuntimeException("Student not found"));

        MvcResult mvcResult = mockMvc.perform(
                get(TestPaths.buildInternshipManagerDownloadResumeUrl(999L))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
    }

    @Test
    void verifyStudentResume_Approve() throws Exception {
        // Test d'approbation d'un CV
        Student student = createTestStudents().getFirst();
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));
        when(internshipManagerService.verifyResume(1L, true, null)).thenReturn(StudentDTO.fromEntity(student));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("isApproved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("APPROVED");
    }

    @Test
    void verifyStudentResume_Reject() throws Exception {
        // Test de refus d'un CV
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.REJECTED);
        student.setResumeRejectionReason("CV incomplet");
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));
        when(internshipManagerService.verifyResume(1L, false, "CV incomplet")).thenReturn(StudentDTO.fromEntity(student));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("isApproved", "false")
                    .param("rejectionReason", "CV incomplet")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("REJECTED");
        assertThat(responseContent).contains("CV incomplet");
    }

    @Test
    void verifyStudentCV_StudentNotFound() throws Exception {
        // Test avec étudiant non trouvé
        when(internshipManagerService.verifyResume(999L, true, null)).thenThrow(new RuntimeException("Student not found"));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(999L))
                    .param("isApproved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Student not found");
    }

    @Test
    void verifyStudentResume_AlreadyProcessed() throws Exception {
        // Test avec CV déjà traité
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);
        when(internshipManagerService.verifyResume(1L, true, null)).thenThrow(new RuntimeException("Ce CV a déjà été traité"));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("isApproved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Ce CV a déjà été traité");
    }

    @Test
    void verifyStudentCV_NoResume() throws Exception {
        // Test avec étudiant sans CV
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.NONE);
        when(internshipManagerService.verifyResume(1L, true, null)).thenThrow(new RuntimeException("Aucun CV trouvé pour cet étudiant"));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("isApproved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Aucun CV trouvé pour cet étudiant");
    }

    @Test
    void verifyStudentResume_ServiceException() throws Exception {
        // Test avec exception du service
        Student student = createTestStudents().get(0);
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));
        when(internshipManagerService.verifyResume(1L, true, null)).thenThrow(new RuntimeException("Erreur de service"));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("isApproved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Erreur de service");
    }

    @Test
    void createInternshipContract_Conflict() throws Exception {
        // Arrange
        doThrow(InternshipOfferNotAcceptedByStudentException.class)
            .when(internshipManagerService)
            .createInternshipContract(any(InternshipContractDTO.class));

        InternshipContractDTO internshipContractDTO = new InternshipContractDTO();

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(internshipContractDTO)))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
    }

    @Test
    void createInternshipContract_NotFound() throws Exception {
        // Arrange
        doThrow(NoSuchElementException.class)
            .when(internshipManagerService)
            .createInternshipContract(any(InternshipContractDTO.class));

        InternshipContractDTO internshipContractDTO = new InternshipContractDTO();

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(internshipContractDTO)))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
    }

    @Test
    void createInternshipContract_BadRequest() throws Exception {
        // Arrange
        doThrow(RuntimeException.class)
            .when(internshipManagerService)
            .createInternshipContract(any(InternshipContractDTO.class));

        InternshipContractDTO internshipContractDTO = new InternshipContractDTO();

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(internshipContractDTO)))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
    }

    @Test
    void createInternshipContract_Created() throws Exception {
        // Arrange
        doNothing()
            .when(internshipManagerService).createInternshipContract(any(InternshipContractDTO.class));

        InternshipContractDTO internshipContractDTO = new InternshipContractDTO();

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(internshipContractDTO)))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
    }

    @Test()
    void findAllInternshipContracts_ReturnListOfContracts() throws Exception {
        // Arrange
        InternshipContractDTO internshipContractDTO1 = new InternshipContractDTO();
        internshipContractDTO1.setId(1L);

        InternshipContractDTO internshipContractDTO2 = new InternshipContractDTO();
        internshipContractDTO2.setId(2L);

        when(internshipManagerService.findAllInternshipContracts()).thenReturn(List.of(
            internshipContractDTO1, internshipContractDTO2
        ));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH)
        ).andReturn();

        List<InternshipContractDTO> internshipContractDTOS = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(), new TypeReference<>() {
            }
        );

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(internshipContractDTOS.getFirst().getId()).isEqualTo(1L);
    }

    @Test()
    void findAllInternshipContracts_BadRequest() throws Exception {
        // Arrange
        doThrow(NoSuchElementException.class)
            .when(internshipManagerService)
            .findAllInternshipContracts();

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
    }

    @Test
    void signContract_Success() throws Exception {
        // Arrange
        Long contractId = 1L;
        InternshipContractDTO signedContract = new InternshipContractDTO();
        signedContract.setId(contractId);
        signedContract.setIsSignedInternshipManager(true);

        when(internshipManagerService.signContract(contractId)).thenReturn(signedContract);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_SIGN_CONTRACT_PATH.replace("{contractId}", String.valueOf(contractId)))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        InternshipContractDTO result = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            InternshipContractDTO.class
        );
        assertThat(result.getId()).isEqualTo(contractId);
        assertThat(result.getIsSignedInternshipManager()).isTrue();
    }

    @Test
    void signContract_NotFound() throws Exception {
        // Arrange
        Long contractId = 999L;
        when(internshipManagerService.signContract(contractId))
            .thenThrow(new NoSuchElementException("Contrat non trouvé"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_SIGN_CONTRACT_PATH.replace("{contractId}", String.valueOf(contractId)))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Contrat non trouvé");
    }

    @Test
    void signContract_AlreadySigned() throws Exception {
        // Arrange
        Long contractId = 1L;
        when(internshipManagerService.signContract(contractId))
            .thenThrow(new IllegalStateException("Ce contrat a déjà été signé par le gestionnaire de stages"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_SIGN_CONTRACT_PATH.replace("{contractId}", String.valueOf(contractId)))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Ce contrat a déjà été signé par le gestionnaire de stages");
    }

    @Test
    void signContract_BadRequest() throws Exception {
        // Arrange
        Long contractId = 1L;
        when(internshipManagerService.signContract(contractId))
            .thenThrow(new RuntimeException("Erreur lors de la signature"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_SIGN_CONTRACT_PATH.replace("{contractId}", String.valueOf(contractId)))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Erreur lors de la signature");
    }

    @Test
    void getAllProfessors_Ok() throws Exception {
        // Arrange
        ProfessorDTO professor1 = ProfessorDTO.builder()
            .email("prof@gmail.com")
            .build();

        List<ProfessorDTO> professors = List.of(professor1);

        when(internshipManagerService.findAllProfessors()).thenReturn(professors);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_PROFESSORS_PATH)
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        String json = mvcResult.getResponse().getContentAsString();
        List<ProfessorDTO> result = objectMapper.readValue(
            json, new TypeReference<List<ProfessorDTO>>() {}
        );
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(result.size()).isEqualTo(1);
    }

    @Test
    void getAllProfessors_BadRequest() throws Exception {
        // Arrange
        when(internshipManagerService.findAllProfessors()).thenThrow(RuntimeException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_PROFESSORS_PATH)
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
    }

    @Test
    void assignProfessorToStudent_CONFLICT() throws Exception {
        // Arrange
        long studentId = 1L;
        long professorId = 2L;

        when(internshipManagerService.assignProfessorToStudent(studentId, professorId))
            .thenThrow(IllegalStateException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_ASSIGN_PROFESSOR_TO_STUDENT_PATH.replace("{professorID}", String.valueOf(professorId)))
                    .param("studentID", String.valueOf(studentId))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
    }

    @Test
    void assignProfessorToStudent_BadRequest() throws Exception {
        // Arrange
        long studentId = 1L;
        long professorId = 2L;

        when(internshipManagerService.assignProfessorToStudent(studentId, professorId))
            .thenThrow(RuntimeException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                post(Paths.INTERNSHIP_MANAGER_ASSIGN_PROFESSOR_TO_STUDENT_PATH.replace("{professorID}", String.valueOf(professorId)))
                    .param("studentID", String.valueOf(studentId))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
    }
}
