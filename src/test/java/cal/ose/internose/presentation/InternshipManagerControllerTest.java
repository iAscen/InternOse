package cal.ose.internose.presentation;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Credentials;
import cal.ose.internose.modele.Role;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
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
import java.util.Optional;

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
    void findInternshipsBy() throws Exception {
        when(internshipManagerService.findInternshipsBy(
                "Informatique", null, null, null)).thenReturn(
                        List.of(InternshipOfferDTO.builder().domain("Informatique").build()));

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.SEARCH_INTERNSHIPS_PATH)
                        .param("domain", "Informatique")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        List<InternshipOfferDTO> responseList = objectMapper.readValue(
                mvcResult.getResponse().getContentAsString(),
                new TypeReference<List<InternshipOfferDTO>>() {
                });

        assertThat(mvcResult.getResponse().getStatus())
                .isEqualTo(HttpStatus.OK.value());

        assertThat(responseList.getFirst().getDomain()).isEqualTo("Informatique");
    }

    @Test
    void findInternshipsByWithFilters() throws Exception {
        // Test avec filtrage par domaine et statut
        when(internshipManagerService.findInternshipsBy(
                "Informatique", true, "Développeur", "title")).thenReturn(
                        List.of(
                                InternshipOfferDTO.builder().domain("Informatique").jobTitle("Développeur Java")
                                        .validee(true).build(),
                                InternshipOfferDTO.builder().domain("Informatique").jobTitle("Développeur Python")
                                        .validee(true).build()));

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.SEARCH_INTERNSHIPS_PATH)
                        .param("domain", "Informatique")
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
        assertThat(responseList.get(0).getJobTitle()).isEqualTo("Développeur Java");
    }

    @Test
    void findInternshipsByWithSorting() throws Exception {
        // Test avec tri par statut
        when(internshipManagerService.findInternshipsBy(
                null, null, null, "status")).thenReturn(
                        List.of(
                                InternshipOfferDTO.builder().domain("Informatique").validee(false).build(),
                                InternshipOfferDTO.builder().domain("Biologie").validee(true).build()));

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.SEARCH_INTERNSHIPS_PATH)
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
    void findInternshipsByEmptyResult() throws Exception {
        // Test avec aucun résultat
        when(internshipManagerService.findInternshipsBy(
                "NonExistent", null, null, null)).thenReturn(List.of());

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.SEARCH_INTERNSHIPS_PATH)
                        .param("domain", "NonExistent")
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
    void validateInternshipOffer_Approve() throws Exception {
        // Test d'approbation d'une offre de stage
        Long offerId = 1L;
        Boolean approved = true;
        String comment = "Offre approuvée";

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_VALIDATION_PATH)
                        .param("offerId", String.valueOf(offerId))
                        .param("approved", String.valueOf(approved))
                        .param("commentaire", comment)
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(mvcResult.getResponse().getContentAsString()).contains(Paths.INTERNSHIP_VALIDATION_PATH);
    }

    @Test
    void validateInternshipOffer_Reject() throws Exception {
        // Test de rejet d'une offre de stage
        Long offerId = 2L;
        Boolean approved = false;
        String comment = "Description insuffisante";

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_VALIDATION_PATH)
                        .param("offerId", String.valueOf(offerId))
                        .param("approved", String.valueOf(approved))
                        .param("commentaire", comment)
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(mvcResult.getResponse().getContentAsString()).contains(Paths.INTERNSHIP_VALIDATION_PATH);
    }

    @Test
    void validateInternshipOffer_ApproveWithoutComment() throws Exception {
        // Test d'approbation sans commentaire
        Long offerId = 3L;
        Boolean approved = true;

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.INTERNSHIP_VALIDATION_PATH)
                        .param("offerId", String.valueOf(offerId))
                        .param("approved", String.valueOf(approved))
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(mvcResult.getResponse().getContentAsString()).contains(Paths.INTERNSHIP_VALIDATION_PATH);
    }

    @Test
    void getAllStudentCVs() throws Exception {
        // Test de base pour récupérer tous les CVs des étudiants
        when(studentService.getAllStudentsWithCVs(null, null, null))
                .thenReturn(createTestStudents());

        MvcResult mvcResult = mockMvc.perform(
                get("/api/internship-manager/students/cvs")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("success");
        assertThat(responseContent).contains("data");
        assertThat(responseContent).contains("totalCount");
    }

    @Test
    void getAllStudentCVsWithFilters() throws Exception {
        // Test avec filtrage par statut et tri
        when(studentService.getAllStudentsWithCVs("name", "asc", "PENDING"))
                .thenReturn(createTestStudents().stream()
                        .filter(s -> s.getCvStatus() == DocumentStatus.PENDING)
                        .toList());

        MvcResult mvcResult = mockMvc.perform(
                get("/api/internship-manager/students/cvs")
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
    void getAllStudentCVsWithSorting() throws Exception {
        // Test avec tri par date
        when(studentService.getAllStudentsWithCVs("date", "desc", null))
                .thenReturn(createTestStudents());

        MvcResult mvcResult = mockMvc.perform(
                get("/api/internship-manager/students/cvs")
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
                .credentials(new Credentials("alice@example.com", "password", Role.STUDENT))
                .cvStatus(DocumentStatus.PENDING)
                .cvUploadedAt(LocalDateTime.now().minusDays(1))
                .build();
        student1.setId(1L);

        Student student2 = Student.builder()
                .firstName("Bob")
                .lastName("Johnson")
                .credentials(new Credentials("bob@example.com", "password", Role.STUDENT))
                .cvStatus(DocumentStatus.APPROVED)
                .cvUploadedAt(LocalDateTime.now().minusDays(2))
                .build();
        student2.setId(2L);

        return List.of(student1, student2);
    }

    // ===== MES NOUVELLES MÉTHODES DE TEST POUR LA VALIDATION DES CVs =====

    @Test
    void getStudentCVDetails_Success() throws Exception {
        // Test de récupération des détails d'un CV d'étudiant
        Student student = createTestStudents().get(0);
        student.setCVFileName("alice_cv.pdf");
        student.setCVFileType("application/pdf");
        when(studentService.getStudentById(1L)).thenReturn(Optional.of(student));

        MvcResult mvcResult = mockMvc.perform(
                get("/api/internship-manager/students/1/cv")
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
        when(studentService.getStudentById(999L)).thenReturn(Optional.empty());

        MvcResult mvcResult = mockMvc.perform(
                get("/api/internship-manager/students/999/cv")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Étudiant non trouvé");
    }

    @Test
    void downloadStudentCV_Success() throws Exception {
        // Test de téléchargement d'un CV
        Student student = createTestStudents().get(0);
        student.setCVFileData("test cv data".getBytes());
        student.setCVFileName("test_cv.pdf");
        when(studentService.getStudentById(1L)).thenReturn(Optional.of(student));

        MvcResult mvcResult = mockMvc.perform(
                get("/api/internship-manager/students/1/cv/download")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    void downloadStudentCV_StudentNotFound() throws Exception {
        // Test de téléchargement avec étudiant non trouvé
        when(studentService.getStudentById(999L)).thenReturn(Optional.empty());

        MvcResult mvcResult = mockMvc.perform(
                get("/api/internship-manager/students/999/cv/download")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
    }

    @Test
    void validateStudentCV_Approve() throws Exception {
        // Test d'approbation d'un CV
        Student student = createTestStudents().get(0);
        when(studentService.getStudentById(1L)).thenReturn(Optional.of(student));
        doNothing().when(internshipManagerService).validateStudentCV(1L, true, null);

        MvcResult mvcResult = mockMvc.perform(
                post("/api/internship-manager/students/1/cv/validate")
                        .param("approved", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("CV validé avec succès");
    }

    @Test
    void validateStudentCV_Reject() throws Exception {
        // Test de refus d'un CV
        Student student = createTestStudents().get(0);
        when(studentService.getStudentById(1L)).thenReturn(Optional.of(student));
        doNothing().when(internshipManagerService).validateStudentCV(1L, false, "CV incomplet");

        MvcResult mvcResult = mockMvc.perform(
                post("/api/internship-manager/students/1/cv/validate")
                        .param("approved", "false")
                        .param("reason", "CV incomplet")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("CV refusé avec succès");
    }

    @Test
    void validateStudentCV_StudentNotFound() throws Exception {
        // Test avec étudiant non trouvé
        when(studentService.getStudentById(999L)).thenReturn(Optional.empty());

        MvcResult mvcResult = mockMvc.perform(
                post("/api/internship-manager/students/999/cv/validate")
                        .param("approved", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Étudiant non trouvé");
    }

    @Test
    void validateStudentCV_AlreadyProcessed() throws Exception {
        // Test avec CV déjà traité
        Student student = createTestStudents().get(0);
        student.setCvStatus(DocumentStatus.APPROVED);
        when(studentService.getStudentById(1L)).thenReturn(Optional.of(student));

        MvcResult mvcResult = mockMvc.perform(
                post("/api/internship-manager/students/1/cv/validate")
                        .param("approved", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Ce CV a déjà été traité");
    }

    @Test
    void validateStudentCV_NoCV() throws Exception {
        // Test avec étudiant sans CV
        Student student = createTestStudents().get(0);
        student.setCvStatus(DocumentStatus.NONE);
        when(studentService.getStudentById(1L)).thenReturn(Optional.of(student));

        MvcResult mvcResult = mockMvc.perform(
                post("/api/internship-manager/students/1/cv/validate")
                        .param("approved", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Aucun CV trouvé pour cet étudiant");
    }

    @Test
    void validateStudentCV_ServiceException() throws Exception {
        // Test avec exception du service
        Student student = createTestStudents().get(0);
        when(studentService.getStudentById(1L)).thenReturn(Optional.of(student));
        doThrow(new RuntimeException("Erreur de service")).when(internshipManagerService).validateStudentCV(1L, true, null);

        MvcResult mvcResult = mockMvc.perform(
                post("/api/internship-manager/students/1/cv/validate")
                        .param("approved", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Erreur lors de la validation du CV");
    }

}