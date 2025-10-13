package cal.ose.internose.presentation;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.security.Paths;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.ErrorResponseDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.EmployerService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(EmployerController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("EmployerController Tests")
public class EmployerControllerTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EmployerService employerService;

    @Test
    @DisplayName("Test de GET /api/employer/internship-offers")
    public void testGETInternshipOffers() throws Exception {
        // Arrange
        Long employerID = 1L;
        List<InternshipOfferDTO> internshipOffers = exampleInternshipOffers();
        when(employerService.listInternshipOffers(anyLong())).thenReturn(internshipOffers);
        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.INTERNSHIP_OFFERS_PATH + "?employerID=" + employerID)
            .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        List<InternshipOfferDTO> internshipOfferDTOs = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            objectMapper.getTypeFactory().constructCollectionType(List.class, InternshipOfferDTO.class)
        );
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(internshipOfferDTOs.size()).isEqualTo(1);
    }

    @Test
    @DisplayName("Test de POST /api/employer/internship-offers")
    public void testPOSTInternshipOffers() throws Exception {
        // Arrange
        Long employerID = 1L;
        InternshipOfferDTO internshipOfferDTO = exampleInternshipOffers().getFirst();
        InternshipOffer internshipOffer = InternshipOffer.fromDTO(internshipOfferDTO);
        when(employerService.createInternshipOffer(anyLong(), any(InternshipOfferDTO.class))).thenReturn(Optional.of(internshipOffer));
        // Act
        MvcResult mvcResult = mockMvc.perform(
            post(Paths.INTERNSHIP_OFFERS_PATH + "?employerID=" + employerID)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(internshipOfferDTO))
        ).andReturn();
        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
    }

    @Test
    public void testFindStudentsBy() throws Exception {
        when(employerService.findStudentsBy(1L, null, null, null, null))
                .thenReturn(new ArrayList<>());

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENTS_BY_INTERNSHIP_OFFER_PATH)
                        .param("internshipId", "1")
        ).andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    public void testFindStudentsBy_ThrowsResourceNotFoundException() throws Exception {
        when(employerService.findStudentsBy(1L, null, null, null, null))
                .thenThrow(new ResourceNotFoundException("error"));

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENTS_BY_INTERNSHIP_OFFER_PATH)
                        .param("internshipId", "1")
        ).andReturn();

        String body = mvcResult.getResponse().getContentAsString();

        ErrorResponseDTO errorResponseDTO = objectMapper.readValue(body,  ErrorResponseDTO.class);

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(errorResponseDTO.getMessage()).isEqualTo("error");
    }

    @Test
    public void testGetStudentApplicationDetails() throws Exception {
        StudentDTO application = StudentDTO.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .program("Computer Science")
                .institution("University")
                .applicationDate(java.time.LocalDateTime.now())
                .applicationStatus(cal.ose.internose.modele.StudentApplication.ApplicationStatus.PENDING)
                .coverLetter("I am very interested in this position...")
                .build();

        when(employerService.getStudentApplicationDetails(1L, 1L))
                .thenReturn(application);

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_APPLICATION_DETAILS_PATH)
                        .param("internshipId", "1")
                        .param("studentId", "1")
        ).andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        
        String responseBody = mvcResult.getResponse().getContentAsString();
        StudentDTO responseApplication = objectMapper.readValue(responseBody, StudentDTO.class);
        
        assertThat(responseApplication.getFirstName()).isEqualTo("John");
        assertThat(responseApplication.getLastName()).isEqualTo("Doe");
        assertThat(responseApplication.getCoverLetter()).isEqualTo("I am very interested in this position...");
    }

    @Test
    public void testGetStudentApplicationDetails_ThrowsResourceNotFoundException() throws Exception {
        when(employerService.getStudentApplicationDetails(1L, 1L))
                .thenThrow(new ResourceNotFoundException("Application not found"));

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.STUDENT_APPLICATION_DETAILS_PATH)
                        .param("internshipId", "1")
                        .param("studentId", "1")
        ).andReturn();

        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        
        String body = mvcResult.getResponse().getContentAsString();
        ErrorResponseDTO errorResponseDTO = objectMapper.readValue(body, ErrorResponseDTO.class);
        assertThat(errorResponseDTO.getMessage()).isEqualTo("Application not found");
    }

    private List<InternshipOfferDTO> exampleInternshipOffers() {
        List<InternshipOfferDTO> offresStage = new ArrayList<>();
        offresStage.add(
            InternshipOfferDTO.builder()
                .jobTitle("Ingénieur logiciel junior chez Artyom Tech Inc.")
                .taskDescription("*description ici*")
                .program("Technique de l'informatique")
                .qualifications("*compétences requises ici*")
                .duration(6)
                .startDate(LocalDate.of(2026, 1, 23))
                .salary(25.0)
                .address("*adresse du stage ici*")
                .build()
        );
        return offresStage;
    }
}
