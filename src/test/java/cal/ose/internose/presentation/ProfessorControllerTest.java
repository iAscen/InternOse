package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.ProfessorService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@WebMvcTest(ProfessorController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ProfessorController Tests")
public class ProfessorControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProfessorService professorService;

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Exécution normale")
    void testFindInternshipContracts_NormalExecution() throws Exception {
        // Arrange
        Long professorId = 1L;
        List<InternshipContractDTO> mockContracts = createTestContractDTOs();
        when(professorService.findInternshipContracts(professorId)).thenReturn(mockContracts);

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", String.valueOf(professorId)))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        List<InternshipContractDTO> result = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipContractDTO>>() {}
        );
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getStudentFirstName()).isEqualTo("John");
        assertThat(result.get(0).getStudentLastName()).isEqualTo("Doe");
        assertThat(result.get(0).getEmployerCompany()).isEqualTo("TechCorp");
    }

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Professeur non trouvé")
    void testFindInternshipContracts_ProfessorNotFound() throws Exception {
        // Arrange
        Long professorId = 999L;
        when(professorService.findInternshipContracts(professorId))
            .thenThrow(new NoSuchElementException("Professeur non trouvé"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", String.valueOf(professorId)))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Professeur non trouvé");
    }

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Liste vide")
    void testFindInternshipContracts_EmptyList() throws Exception {
        // Arrange
        Long professorId = 1L;
        when(professorService.findInternshipContracts(professorId)).thenReturn(List.of());

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", String.valueOf(professorId)))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        List<InternshipContractDTO> result = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipContractDTO>>() {}
        );
        assertThat(result.size()).isEqualTo(0);
    }

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Erreur de service")
    void testFindInternshipContracts_ServiceError() throws Exception {
        // Arrange
        Long professorId = 1L;
        when(professorService.findInternshipContracts(professorId))
            .thenThrow(new RuntimeException("Erreur lors de la récupération des contrats"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", String.valueOf(professorId)))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("Erreur lors de la récupération des contrats");
    }

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Vérification des données complètes")
    void testFindInternshipContracts_CompleteData() throws Exception {
        // Arrange
        Long professorId = 1L;
        InternshipContractDTO contract = InternshipContractDTO.builder()
            .id(1L)
            .studentFirstName("John")
            .studentLastName("Doe")
            .studentEmail("john.doe@example.com")
            .studentProgram("420.B0")
            .employerCompany("TechCorp")
            .internshipOfferAddress("123 Main St, Montreal, QC")
            .internshipOfferSession("H2024")
            .supervisorName("Jane Smith")
            .supervisorEmail("jane.smith@techcorp.com")
            .supervisorPhone("514-123-4567")
            .startDate(LocalDate.of(2024, 6, 1))
            .endDate(LocalDate.of(2024, 8, 31))
            .isSignedStudent(true)
            .isSignedEmployer(true)
            .isSignedInternshipManager(true)
            .build();

        when(professorService.findInternshipContracts(professorId)).thenReturn(List.of(contract));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", String.valueOf(professorId)))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        List<InternshipContractDTO> result = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipContractDTO>>() {}
        );
        assertThat(result.size()).isEqualTo(1);
        InternshipContractDTO resultContract = result.get(0);
        assertThat(resultContract.getStudentEmail()).isEqualTo("john.doe@example.com");
        assertThat(resultContract.getStudentProgram()).isEqualTo("420.B0");
        assertThat(resultContract.getInternshipOfferAddress()).isEqualTo("123 Main St, Montreal, QC");
        assertThat(resultContract.getInternshipOfferSession()).isEqualTo("H2024");
    }

    private List<InternshipContractDTO> createTestContractDTOs() {
        InternshipContractDTO contract1 = InternshipContractDTO.builder()
            .id(1L)
            .studentFirstName("John")
            .studentLastName("Doe")
            .studentEmail("john.doe@example.com")
            .studentProgram("420.B0")
            .employerCompany("TechCorp")
            .internshipOfferAddress("123 Main St, Montreal, QC")
            .internshipOfferSession("H2024")
            .supervisorName("Jane Smith")
            .supervisorEmail("jane.smith@techcorp.com")
            .supervisorPhone("514-123-4567")
            .startDate(LocalDate.of(2024, 6, 1))
            .endDate(LocalDate.of(2024, 8, 31))
            .isSignedStudent(true)
            .isSignedEmployer(false)
            .isSignedInternshipManager(false)
            .build();

        InternshipContractDTO contract2 = InternshipContractDTO.builder()
            .id(2L)
            .studentFirstName("Alice")
            .studentLastName("Johnson")
            .studentEmail("alice.johnson@example.com")
            .studentProgram("410.A1")
            .employerCompany("DataSys")
            .internshipOfferAddress("456 Tech Ave, Montreal, QC")
            .internshipOfferSession("H2024")
            .supervisorName("Bob Wilson")
            .supervisorEmail("bob.wilson@datasys.com")
            .supervisorPhone("514-987-6543")
            .startDate(LocalDate.of(2024, 6, 15))
            .endDate(LocalDate.of(2024, 9, 15))
            .isSignedStudent(true)
            .isSignedEmployer(true)
            .isSignedInternshipManager(true)
            .build();

        return List.of(contract1, contract2);
    }
}

