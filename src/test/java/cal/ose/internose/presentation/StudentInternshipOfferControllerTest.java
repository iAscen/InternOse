package cal.ose.internose.presentation;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.StudentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@ExtendWith(MockitoExtension.class)
@DisplayName("Student Internship Offer Controller Tests")
public class StudentInternshipOfferControllerTest {

    @Mock
    private StudentService studentService;

    @Mock
    private StudentDAO studentDAO;


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
            .build();
    }

    @Test
    @DisplayName("Test de la méthode getAllInternshipOffers() (GET /api/student/internship-offers)")
    public void testGetAllInternshipOffers() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();
        when(studentService.getAllApprovedInternshipOffers(studentId)).thenReturn(mockOffers);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFERS_PATH)
                        .param("studentId", studentId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Développeur Java");
        assertThat(responseContent).contains("Analyste de données");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec filtres de base")
    public void testSearchInternshipOffers_WithBasicFilters() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();
        Page<InternshipOfferDTO> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 10), 2);

        when(studentService.searchInternshipOffers(any(), eq(studentId))).thenReturn(mockPage);
        when(studentService.countInternshipOffers(any(), eq(studentId))).thenReturn(2L);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFERS_PATH + "/search")
                        .param("studentId", studentId.toString())
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
        assertThat(responseContent).contains("offers");
        assertThat(responseContent).contains("totalElements");
        assertThat(responseContent).contains("totalPages");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec filtres de salaire")
    public void testSearchInternshipOffers_WithSalaryFilters() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);


        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();
        Page<InternshipOfferDTO> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 10), 2);

        when(studentService.searchInternshipOffers(any(), eq(studentId))).thenReturn(mockPage);
        when(studentService.countInternshipOffers(any() ,eq(studentId))).thenReturn(2L);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFERS_PATH + "/search")
                    .param("studentId", studentId.toString())
                    .param("minSalary", "500")
                    .param("maxSalary", "1000")
                    .param("sortBy", "salary")
                    .param("sortOrder", "desc")
                    .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("offers");
        assertThat(responseContent).contains("totalElements");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec filtres de date")
    public void testSearchInternshipOffers_WithDateFilters() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();
        Page<InternshipOfferDTO> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 10), 2);

        when(studentService.searchInternshipOffers(any(), eq(studentId))).thenReturn(mockPage);
        when(studentService.countInternshipOffers(any(), eq(studentId))).thenReturn(2L);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFERS_PATH + "/search")
                    .param("studentId", studentId.toString())
                    .param("startDateFrom", "2024-06-01")
                    .param("startDateTo", "2024-08-31")
                    .param("sortBy", "startDate")
                    .param("sortOrder", "asc")
                    .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("offers");
        assertThat(responseContent).contains("totalElements");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() sans paramètres")
    public void testSearchInternshipOffers_NoParameters() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);

        List<InternshipOfferDTO> mockOffers = createTestOfferDTOs();
        Page<InternshipOfferDTO> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 10), 2);

        when(studentService.searchInternshipOffers(any(), eq(studentId))).thenReturn(mockPage);
        when(studentService.countInternshipOffers(any(), eq(studentId))).thenReturn(2L);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFERS_PATH + "/search")
                    .param("studentId", studentId.toString())
                    .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("offers");
        assertThat(responseContent).contains("totalElements");
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferDetails() avec offre trouvée")
    public void testGetInternshipOfferDetails_OfferFound() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);

        Long offerId = 1L;
        InternshipOfferDTO mockOffer = createTestOfferDTO();
        when(studentService.getInternshipOfferById(offerId, studentId)).thenReturn(Optional.of(mockOffer));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFER_DETAILS_PATH + "/" + offerId)
                    .param("studentId", studentId.toString())
                    .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("offer");
        assertThat(responseContent).contains("Développeur Java");
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferDetails() avec offre non trouvée")
    public void testGetInternshipOfferDetails_OfferNotFound() throws Exception {
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);

        // Arrange
        Long offerId = 999L;
        when(studentService.getInternshipOfferById(offerId, studentId)).thenReturn(Optional.empty());

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFER_DETAILS_PATH + "/" + offerId)
                    .param("studentId", studentId.toString())
                    .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("error");
        assertThat(responseContent).contains("Offre de stage non trouvée");
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec erreur de service")
    public void testSearchInternshipOffers_ServiceError() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);

        when(studentService.searchInternshipOffers(any(), eq(studentId))).thenThrow(new RuntimeException("Erreur de base de données"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFERS_PATH + "/search")
                    .param("studentId", studentId.toString())
                    .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("error");
        assertThat(responseContent).contains("Erreur lors de la recherche des offres de stage");
    }

    @Test
    @DisplayName("Test de la méthode getAllInternshipOffers() avec erreur de service")
    public void testGetAllInternshipOffers_ServiceError() throws Exception {
        // Arrange
        Long studentId = 1L;
        Student student = exampleStudent();
        student.setId(studentId);
        student.setCvStatus(DocumentStatus.APPROVED);

        when(studentService.getAllApprovedInternshipOffers(studentId)).thenThrow(new RuntimeException("Erreur de base de données"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_BASE_PATH + Paths.STUDENT_INTERNSHIP_OFFERS_PATH)
                    .param("studentId", studentId.toString())
                    .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("error");
        assertThat(responseContent).contains("Erreur lors de la recherche des offres de stage");
    }

    private List<InternshipOfferDTO> createTestOfferDTOs() {
        InternshipOfferDTO offer1 = InternshipOfferDTO.builder()
                .id(1L)
                .jobTitle("Développeur Java")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(750.0)
                .duration(12)
                .startDate(LocalDate.of(2024, 6, 1))
                .validationStatus(DocumentStatus.APPROVED)
                .build();

        InternshipOfferDTO offer2 = InternshipOfferDTO.builder()
                .id(2L)
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

    private InternshipOfferDTO createTestOfferDTO() {
        return InternshipOfferDTO.builder()
                .id(1L)
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
