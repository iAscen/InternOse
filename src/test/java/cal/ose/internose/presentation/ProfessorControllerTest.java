package cal.ose.internose.presentation;

import cal.ose.internose.TestPaths;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternAssessmentDTO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.ProfessorService;
import cal.ose.internose.service.exceptions.ForbiddenException;
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

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@WebMvcTest(ProfessorController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("EmployerController Tests")
class ProfessorControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProfessorService professorService;


    @Test()
    @DisplayName("Test de findInternshipContracts() - OK")
    void testFindInternshipContracts_OK() throws Exception {
        // Arrange
        InternshipContractDTO internshipContractDTO = InternshipContractDTO.builder().id(1L).build();
        InternshipContractDTO internshipContractDTO2 = InternshipContractDTO.builder().id(2L).build();

        List<InternshipContractDTO> internshipContractDTOS = new ArrayList<>();
        internshipContractDTOS.add(internshipContractDTO);
        internshipContractDTOS.add(internshipContractDTO2);

        when(professorService.findInternshipContractsBy(1L, null, null, null, null))
            .thenReturn(internshipContractDTOS);

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", "1"))
            )
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        List<InternshipContractDTO> result = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            new TypeReference<List<InternshipContractDTO>>() {}
        );
        assertThat(result.size()).isEqualTo(2);
    }

    @Test()
    @DisplayName("Test de findInternshipContracts() - NOT_FOUND")
    void testFindInternshipContracts_NOT_FOUND() throws Exception {
        // Arrange
        when(professorService.findInternshipContractsBy(1L, null, null, null, null))
            .thenThrow(NoSuchElementException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", "1"))
            )
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
    }

    @Test()
    @DisplayName("Test de findInternshipContracts() - FORBIDDEN")
    void testFindInternshipContracts_FORBIDDEN() throws Exception {
        // Arrange
        when(professorService.findInternshipContractsBy(1L, null, null, null, null))
            .thenThrow(ForbiddenException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", "1"))
            )
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
    }

    @Test()
    @DisplayName("Test de findInternshipContracts() - BAD_REQUEST")
    void testFindInternshipContracts_BAD_REQUEST() throws Exception {
        // Arrange
        when(professorService.findInternshipContractsBy(1L, null, null, null, null))
            .thenThrow(RuntimeException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.PROFESSOR_INTERNSHIP_CONTRACTS.replace("{professorID}", "1"))
            )
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
    }

    @Test()
    @DisplayName("Test de findInternshipContracts() - OK")
    void testFindInternAssessments_OK() throws Exception {
        // Arrange
        InternAssessmentDTO internAssessmentDTO = InternAssessmentDTO.builder().companyName("Hydro").build();

        when(professorService.findInternAssessment(1L))
            .thenReturn(internAssessmentDTO);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.PROFESSOR_INTERNSHIP_CONTRACT_ASSESSMENT.replace("{contractID}", "1"))
            )
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        InternAssessmentDTO result = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), InternAssessmentDTO.class);
        assertEquals("Hydro", result.getCompanyName());
    }

    @Test()
    @DisplayName("Test de findInternshipContracts() - NOT_FOUND")
    void testFindInternAssessments_NOT_FOUND() throws Exception {
        // Arrange
        when(professorService.findInternAssessment(1L))
            .thenThrow(NoSuchElementException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.PROFESSOR_INTERNSHIP_CONTRACT_ASSESSMENT.replace("{contractID}", "1"))
            )
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
    }

    @Test()
    @DisplayName("Test de findInternshipContracts() - FORBIDDEN")
    void testFindInternAssessments_FORBIDDEN() throws Exception {
        // Arrange
        when(professorService.findInternAssessment(1L))
            .thenThrow(ForbiddenException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.PROFESSOR_INTERNSHIP_CONTRACT_ASSESSMENT.replace("{contractID}", "1"))
            )
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
    }

    @Test()
    @DisplayName("Test de findInternshipContracts() - BAD_REQUEST")
    void testFindInternAssessments_BAD_REQUEST() throws Exception {
        // Arrange
        when(professorService.findInternAssessment(1L))
            .thenThrow(RuntimeException.class);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.PROFESSOR_INTERNSHIP_CONTRACT_ASSESSMENT.replace("{contractID}", "1"))
            )
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
    }

}