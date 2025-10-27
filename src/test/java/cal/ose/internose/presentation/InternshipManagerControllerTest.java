package cal.ose.internose.presentation;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.modele.Credentials;
import cal.ose.internose.modele.UserRole;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.security.Paths;
import cal.ose.internose.TestPaths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
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

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
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
    void findInternshipOffersBy() throws Exception {
        when(internshipManagerService.findInternshipsBy(
            null, "Informatique", null, null)).thenReturn(
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
    void findInternshipOffersByWithFilters() throws Exception {
        // Test avec filtrage par domaine et statut
        when(internshipManagerService.findInternshipsBy(
            true, "Informatique", "Développeur", "title")).thenReturn(
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
                    .param("valid", "true")
                    .param("title", "Développeur")
                    .param("sortBy", "title")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        List<InternshipOfferDTO> responseList = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipOfferDTO>>() {
            });

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(responseList.size()).isEqualTo(2);
        assertThat(responseList.get(0).getTitle()).isEqualTo("Développeur Java");
    }

    @Test
    void findInternshipOffersByWithSorting() throws Exception {
        // Test avec tri par statut
        when(internshipManagerService.findInternshipsBy(
            null, null, null, "status")).thenReturn(
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
    void findInternshipOffersByEmptyResult() throws Exception {
        // Test avec aucun résultat
        when(internshipManagerService.findInternshipsBy(
            null, "NonExistent", null, null)).thenReturn(List.of());

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
        Long offerId = 1L;
        Boolean approved = true;
        String comment = "Offre approuvée";

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH)
                    .param("offerId", String.valueOf(offerId))
                    .param("approved", String.valueOf(approved))
                    .param("commentaire", comment)
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(mvcResult.getResponse().getContentAsString()).contains("Offre de stage validée avec succès");
    }

    @Test
    void verifyInternshipOffer_Reject() throws Exception {
        // Test de rejet d'une offre de stage
        Long offerId = 2L;
        Boolean approved = false;
        String comment = "Description insuffisante";

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH)
                    .param("offerId", String.valueOf(offerId))
                    .param("approved", String.valueOf(approved))
                    .param("commentaire", comment)
                    .contentType(MediaType.APPLICATION_JSON)
            )
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(mvcResult.getResponse().getContentAsString()).contains("Offre de stage refusée avec succès");
    }

    @Test
    void verifyInternshipOffer_ApproveWithoutComment() throws Exception {
        // Test d'approbation sans commentaire
        Long offerId = 3L;
        Boolean approved = true;

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH)
                    .param("offerId", String.valueOf(offerId))
                    .param("approved", String.valueOf(approved))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(mvcResult.getResponse().getContentAsString()).contains("Offre de stage validée avec succès");
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
        assertThat(responseContent).contains("success");
        assertThat(responseContent).contains("data");
        assertThat(responseContent).contains("totalCount");
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
        assertThat(responseContent).contains("success");
        assertThat(responseContent).contains("pending");
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
        assertThat(responseContent).contains("success");
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
        Student student = createTestStudents().get(0);
        student.setResumeFileName("alice_cv.pdf");
        student.setResumeFileType("application/pdf");
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));

        MvcResult mvcResult = mockMvc.perform(
                get(TestPaths.buildInternshipManagerResumeUrl(1L))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("success");
        assertThat(responseContent).contains("Alice");
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
        assertThat(responseContent).contains("Étudiant non trouvé");
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
        Student student = createTestStudents().get(0);
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));
        doNothing().when(internshipManagerService).verifyResume(1L, true, null);

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("approved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("CV validé avec succès");
    }

    @Test
    void verifyStudentResume_Reject() throws Exception {
        // Test de refus d'un CV
        Student student = createTestStudents().get(0);
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));
        doNothing().when(internshipManagerService).verifyResume(1L, false, "CV incomplet");

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("approved", "false")
                    .param("reason", "CV incomplet")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("CV refusé avec succès");
    }

    @Test
    void verifyStudentCV_StudentNotFound() throws Exception {
        // Test avec étudiant non trouvé
        when(studentService.getStudentByID(999L)).thenThrow(new RuntimeException("Student not found"));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(999L))
                    .param("approved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Étudiant non trouvé");
    }

    @Test
    void verifyStudentResume_AlreadyProcessed() throws Exception {
        // Test avec CV déjà traité
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED);
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("approved", "true")
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
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("approved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Aucun CV trouvé pour cet étudiant");
    }

    @Test
    void verifyStudentResume_ServiceException() throws Exception {
        // Test avec exception du service
        Student student = createTestStudents().get(0);
        when(studentService.getStudentByID(1L)).thenReturn(StudentDTO.fromEntity(student));
        doThrow(new RuntimeException("Erreur de service")).when(internshipManagerService).verifyResume(1L,
            true, null);

        MvcResult mvcResult = mockMvc.perform(
                post(TestPaths.buildInternshipManagerVerifyResumeUrl(1L))
                    .param("approved", "true")
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Erreur lors de la validation du CV");
    }
}
