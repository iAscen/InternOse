package cal.ose.internose.presentation;

import cal.ose.internose.TestPaths;
import cal.ose.internose.modele.SiteAssessment;
import cal.ose.internose.service.DTOs.SiteAssessmentDTO;
import cal.ose.internose.service.ProfessorService;
import cal.ose.internose.service.exceptions.ForbiddenException;
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

import java.util.Map;
import java.util.NoSuchElementException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(ProfessorController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ProfessorControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProfessorService professorService;

    @MockitoBean
    private cal.ose.internose.persistance.InternshipOfferDAO internshipOfferDAO;

    @Test
    @DisplayName("GET /api/professors/{professorID}/site-assessment - success")
    public void testFindSiteAssessment_Success() throws Exception {
        // Arrange
        Long professorID = 1L;
        Long contractID = 2L;

        SiteAssessmentDTO dto = SiteAssessmentDTO.builder()
            .studentName("Alice")
            .companyName("SQL Technologies")
            .overallSiteAppreciation(SiteAssessment.OverallSiteAppreciation.EXCELLENT)
            .build();

        when(professorService.findSiteAssessment(eq(professorID), eq(contractID))).thenReturn(dto);

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.PROFESSOR_INTERNSHIP_SITE_ASSESSMENT.replace("{professorID}", String.valueOf(professorID)))
                .param("internshipContractID", String.valueOf(contractID))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        SiteAssessmentDTO response = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), SiteAssessmentDTO.class);
        assertThat(response.getStudentName()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("GET /api/professors/{professorID}/site-assessment - not found")
    public void testFindSiteAssessment_NotFound() throws Exception {
        Long professorID = 1L;
        Long contractID = 999L;

        when(professorService.findSiteAssessment(eq(professorID), eq(contractID))).thenThrow(new NoSuchElementException("Contrat non trouvé"));

        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.PROFESSOR_INTERNSHIP_SITE_ASSESSMENT.replace("{professorID}", String.valueOf(professorID)))
                .param("internshipContractID", String.valueOf(contractID))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        Map<?, ?> response = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), Map.class);
        assertThat(response.get("message")).isEqualTo("Contrat non trouvé");
    }

    @Test
    @DisplayName("GET /api/professors/{professorID}/site-assessment - forbidden")
    public void testFindSiteAssessment_Forbidden() throws Exception {
        Long professorID = 1L;
        Long contractID = 2L;

        when(professorService.findSiteAssessment(eq(professorID), eq(contractID))).thenThrow(new ForbiddenException("Vous n'êtes pas le professeur responsable de ce contrat de stage!"));

        MvcResult mvcResult = mockMvc.perform(
            get(TestPaths.PROFESSOR_INTERNSHIP_SITE_ASSESSMENT.replace("{professorID}", String.valueOf(professorID)))
                .param("internshipContractID", String.valueOf(contractID))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
        Map<?, ?> response = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), Map.class);
        assertThat(response.get("message")).isEqualTo("Vous n'êtes pas le professeur responsable de ce contrat de stage!");
    }

    @Test
    @DisplayName("POST /api/professors/{professorID}/site-assessment - success")
    public void testPostSiteAssessment_Success() throws Exception {
        Long professorID = 1L;
        Long contractID = 2L;

        SiteAssessmentDTO dto = SiteAssessmentDTO.builder()
            .studentName("Alice")
            .companyName("SQL Technologies")
            .overallSiteAppreciation(SiteAssessment.OverallSiteAppreciation.EXCELLENT)
            .build();

        when(professorService.saveSiteAssessment(eq(professorID), eq(contractID), org.mockito.ArgumentMatchers.any(SiteAssessmentDTO.class))).thenReturn(dto);

        MvcResult mvcResult = mockMvc.perform(
            post(TestPaths.PROFESSOR_INTERNSHIP_SITE_ASSESSMENT.replace("{professorID}", String.valueOf(professorID)))
                .param("internshipContractID", String.valueOf(contractID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        ).andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
        SiteAssessmentDTO response = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), SiteAssessmentDTO.class);
        assertThat(response.getCompanyName()).isEqualTo("SQL Technologies");
    }

    @Test
    @DisplayName("POST /api/professors/{professorID}/site-assessment - forbidden")
    public void testPostSiteAssessment_Forbidden() throws Exception {
        Long professorID = 1L;
        Long contractID = 2L;

        SiteAssessmentDTO dto = SiteAssessmentDTO.builder().studentName("Alice").build();

        when(professorService.saveSiteAssessment(eq(professorID), eq(contractID), org.mockito.ArgumentMatchers.any(SiteAssessmentDTO.class)))
            .thenThrow(new ForbiddenException("Vous ne pouvez pas modifier une évaluation du milieu de stage"));

        MvcResult mvcResult = mockMvc.perform(
            post(TestPaths.PROFESSOR_INTERNSHIP_SITE_ASSESSMENT.replace("{professorID}", String.valueOf(professorID)))
                .param("internshipContractID", String.valueOf(contractID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        ).andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
        Map<?, ?> response = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), Map.class);
        assertThat(response.get("message")).isEqualTo("Vous ne pouvez pas modifier une évaluation du milieu de stage");
    }

    @Test
    @DisplayName("POST /api/professors/{professorID}/site-assessment - contract not found")
    public void testPostSiteAssessment_ContractNotFound() throws Exception {
        Long professorID = 1L;
        Long contractID = 999L;

        SiteAssessmentDTO dto = SiteAssessmentDTO.builder().studentName("Alice").build();

        when(professorService.saveSiteAssessment(eq(professorID), eq(contractID), org.mockito.ArgumentMatchers.any(SiteAssessmentDTO.class)))
            .thenThrow(new NoSuchElementException("Contrat non trouvé"));

        MvcResult mvcResult = mockMvc.perform(
            post(TestPaths.PROFESSOR_INTERNSHIP_SITE_ASSESSMENT.replace("{professorID}", String.valueOf(professorID)))
                .param("internshipContractID", String.valueOf(contractID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
        ).andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        Map<?, ?> response = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), Map.class);
        assertThat(response.get("message")).isEqualTo("Contrat non trouvé");
    }
}
