package cal.ose.internose.presentation;

import cal.ose.internose.modele.Interview;
import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.service.DTOs.InterviewDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.exceptions.InterviewAlreadyScheduledException;
import cal.ose.internose.TestPaths;
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
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;

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
                                get(TestPaths.buildEmployerInternshipOffersUrl(employerID))
                                                .contentType(MediaType.APPLICATION_JSON))
                                .andReturn();

                // Assert
                List<InternshipOfferDTO> internshipOfferDTOs = objectMapper.readValue(
                                mvcResult.getResponse().getContentAsString(),
                                objectMapper.getTypeFactory().constructCollectionType(List.class,
                                                InternshipOfferDTO.class));
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
                assertThat(internshipOfferDTOs.size()).isEqualTo(1);
        }

        @Test
        @DisplayName("Test de POST /api/employer/internship-offers")
        public void testPOSTInternshipOffers() throws Exception {
                // Arrange
                Long employerID = 1L;
                InternshipOfferDTO internshipOfferDTO = exampleInternshipOffers().getFirst();
                when(employerService.createInternshipOffer(anyLong(), any(InternshipOfferDTO.class)))
                                .thenReturn(internshipOfferDTO);
                // Act
                MvcResult mvcResult = mockMvc.perform(
                                post(TestPaths.buildEmployerInternshipOffersUrl(employerID))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(internshipOfferDTO)))
                                .andReturn();
                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
        }

        @Test
        public void testGetStudentApplications() throws Exception {
                when(employerService.getStudentApplications(1L, null, null, null, null))
                                .thenReturn(new ArrayList<>());

                MvcResult mvcResult = mockMvc.perform(
                                get(TestPaths.buildEmployerApplicationsUrl(1L))
                                                .param("internshipOfferID", "1"))
                                .andReturn();

                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        }

        @Test
        public void testGetStudentApplications_ThrowsResourceNotFoundException() throws Exception {
                when(employerService.getStudentApplications(1L, null, null, null, null))
                                .thenThrow(new RuntimeException("error"));

                MvcResult mvcResult = mockMvc.perform(
                                get(TestPaths.buildEmployerApplicationsUrl(1L))
                                                .param("internshipOfferID", "1"))
                                .andReturn();

                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
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
                                .applicationStatus(
                                                cal.ose.internose.modele.StudentApplication.ApplicationStatus.PENDING)
                                .build();

                when(employerService.getStudentApplicationDetails(1L, 1L))
                                .thenReturn(application);

                MvcResult mvcResult = mockMvc.perform(
                                get(TestPaths.buildEmployerApplicationDetailsUrl(1L, 1L))
                                                .param("internshipOfferID", "1"))
                                .andReturn();

                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());

                String responseBody = mvcResult.getResponse().getContentAsString();
                StudentDTO responseApplication = objectMapper.readValue(responseBody, StudentDTO.class);

                assertThat(responseApplication.getFirstName()).isEqualTo("John");
                assertThat(responseApplication.getLastName()).isEqualTo("Doe");
        }

        @Test
        public void testGetStudentApplicationDetails_ThrowsResourceNotFoundException() throws Exception {
                when(employerService.getStudentApplicationDetails(1L, 1L))
                                .thenThrow(new RuntimeException("Application not found"));

                MvcResult mvcResult = mockMvc.perform(
                                get(TestPaths.buildEmployerApplicationDetailsUrl(1L, 1L))
                                                .param("internshipOfferID", "1"))
                                .andReturn();

                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }

        private List<InternshipOfferDTO> exampleInternshipOffers() {
                List<InternshipOfferDTO> offresStage = new ArrayList<>();
                offresStage.add(
                                InternshipOfferDTO.builder()
                                                .title("Ingénieur logiciel junior chez Artyom Tech Inc.")
                                                .description("*description ici*")
                                                .program("Technique de l'informatique")
                                                .requiredSkills("*compétences requises ici*")
                                                .duration(6)
                                                .startDate(LocalDate.of(2026, 1, 23))
                                                .salary(25.0)
                                                .address("*adresse du stage ici*")
                                                .build());
                return offresStage;
        }

        @Test
        @DisplayName("Test de POST /api/employer/interviews/schedule - succès")
        public void testPOSTScheduleInterview() throws Exception {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;

                InterviewDTO interviewDTO = InterviewDTO.builder()
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Nous sommes ravis de vous rencontrer")
                                .build();

                InterviewDTO createdInterview = InterviewDTO.builder()
                                .id(1L)
                                .studentApplicationID(1L)
                                .studentID(studentID)
                                .studentFirstName("John")
                                .studentLastName("Doe")
                                .internshipOfferID(internshipOfferID)
                                .title("Stage développeur")
                                .interviewDate(interviewDTO.getInterviewDate())
                                .interviewMode(interviewDTO.getInterviewMode())
                                .location(interviewDTO.getLocation())
                                .personalizedMessage(interviewDTO.getPersonalizedMessage())
                                .interviewStatus(Interview.InterviewStatus.SCHEDULED)
                                .scheduleDate(LocalDateTime.now())
                                .build();

                when(employerService.scheduleInterview(eq(internshipOfferID), eq(studentID), any(InterviewDTO.class)))
                                .thenReturn(createdInterview);

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                post(TestPaths.buildEmployerScheduleInterviewUrl(internshipOfferID, studentID))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(interviewDTO)))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());

                String responseBody = mvcResult.getResponse().getContentAsString();

                assertThat(responseBody).contains("Nous sommes ravis de vous rencontrer");
        }

        @Test
        @DisplayName("Test de POST /api/employer/interviews offre non trouvée")
        public void testPOSTScheduleInterview_OfferNotFound() throws Exception {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;

                InterviewDTO interviewDTO = InterviewDTO.builder()
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Message")
                                .build();

                when(employerService.scheduleInterview(eq(internshipOfferID), eq(studentID), any(InterviewDTO.class)))
                                .thenThrow(new NoSuchElementException("Internship offer not found"));

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                post(TestPaths.buildEmployerScheduleInterviewUrl(internshipOfferID, studentID))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(interviewDTO)))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());

                String responseBody = mvcResult.getResponse().getContentAsString();
                @SuppressWarnings("unchecked")
                Map<String, Object> response = objectMapper.readValue(responseBody, Map.class);

                assertThat(response.get("message")).isEqualTo("Internship offer not found");
        }

        @Test
        @DisplayName("Test de POST /api/employer/interviews/schedule - entrevue déjà existante")
        public void testPOSTScheduleInterview_AlreadyExists() throws Exception {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;

                InterviewDTO interviewDTO = InterviewDTO.builder()
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Message")
                                .build();

                when(employerService.scheduleInterview(eq(internshipOfferID), eq(studentID), any(InterviewDTO.class)))
                                .thenThrow(new InterviewAlreadyScheduledException(
                                                "Une entrevue existe déjà pour cette candidature"));

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                post(TestPaths.buildEmployerScheduleInterviewUrl(internshipOfferID, studentID))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(interviewDTO)))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CONFLICT.value());

                String responseBody = mvcResult.getResponse().getContentAsString();
                @SuppressWarnings("unchecked")
                Map<String, Object> response = objectMapper.readValue(responseBody, Map.class);

                assertThat(response.get("message")).isEqualTo("Une entrevue existe déjà pour cette candidature");
        }

        @Test
        @DisplayName("Test de POST /api/employer/interviews - JSON invalide")
        public void testPOSTScheduleInterview_InvalidJSON() throws Exception {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;
                String invalidJSON = "{ invalid json }";

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                post(TestPaths.buildEmployerScheduleInterviewUrl(internshipOfferID, studentID))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(invalidJSON))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());

                String responseBody = mvcResult.getResponse().getContentAsString();

                System.out.println(responseBody);

                assertThat(responseBody).containsAnyOf(
                                "La structure JSON fournie est incorrecte",
                                "Unexpected character");
        }

        @Test
        @DisplayName("Test de GET /api/employer/interviews - succès")
        public void testGETScheduledInterviews() throws Exception {
                // Arrange
                Long employerID = 1L;

                List<InterviewDTO> interviews = new ArrayList<>();
                interviews.add(InterviewDTO.builder()
                                .id(1L)
                                .studentApplicationID(1L)
                                .studentID(1L)
                                .studentFirstName("John")
                                .studentLastName("Doe")
                                .internshipOfferID(1L)
                                .title("Stage développeur")
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Message personnalisé")
                                .interviewStatus(Interview.InterviewStatus.SCHEDULED)
                                .scheduleDate(LocalDateTime.now())
                                .build());

                when(employerService.getInterviewsByEmployer(employerID)).thenReturn(interviews);

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                get(TestPaths.buildEmployerInterviewsUrl(employerID))
                                                .contentType(MediaType.APPLICATION_JSON))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());

                String responseBody = mvcResult.getResponse().getContentAsString();

                assertThat(responseBody).contains("Stage développeur");

        }

        @Test
        @DisplayName("Test de GET /api/employer/interviews - employeur non trouvé")
        public void testGETEmployerInterviews_ScheduledNotFound() throws Exception {
                // Arrange
                Long employerID = 1L;

                when(employerService.getInterviewsByEmployer(employerID))
                                .thenThrow(new NoSuchElementException("Employer not found"));

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                get(TestPaths.buildEmployerInterviewsUrl(employerID))
                                                .contentType(MediaType.APPLICATION_JSON))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());

                String responseBody = mvcResult.getResponse().getContentAsString();

                assertThat(responseBody).contains("Employer not found");
        }

        @Test
        @DisplayName("Test de GET /api/employer/interviews - liste vide")
        public void testGETScheduledInterviews_EmptyList() throws Exception {
                // Arrange
                Long employerID = 1L;

                when(employerService.getInterviewsByEmployer(employerID)).thenReturn(new ArrayList<>());

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                get(TestPaths.buildEmployerInterviewsUrl(employerID))
                                                .contentType(MediaType.APPLICATION_JSON))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());

                String responseBody = mvcResult.getResponse().getContentAsString();

                // Parse as array and check size
                List<?> responseList = objectMapper.readValue(
                                responseBody,
                                objectMapper.getTypeFactory().constructCollectionType(List.class, Object.class));
                assertThat(responseList.size()).isEqualTo(0);
        }

        @Test
        @DisplayName("Test de PUT /api/employer/internship-offers/{internshipOfferID}/student-applications/{studentID}/status - accepter candidature")
        public void testUpdateApplicationStatus_Approve() throws Exception {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;
                String requestBody = "{\"applicationStatus\":\"APPROVED\"}";

                doNothing().when(employerService).updateApplicationStatus(
                                eq(internshipOfferID),
                                eq(studentID),
                                eq(StudentApplication.ApplicationStatus.APPROVED),
                                anyString());

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                put(TestPaths.buildEmployerUpdateApplicationStatusUrl(internshipOfferID, studentID))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(requestBody))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
                String responseBody = mvcResult.getResponse().getContentAsString();
                assertThat(responseBody).contains("acceptée avec succès");
                verify(employerService, times(1)).updateApplicationStatus(
                                eq(internshipOfferID),
                                eq(studentID),
                                eq(StudentApplication.ApplicationStatus.APPROVED),
                                any());
        }

        @Test
        @DisplayName("Test de PUT /api/employer/internship-offers/{internshipOfferID}/student-applications/{studentID}/status - refuser candidature")
        public void testUpdateApplicationStatus_Reject() throws Exception {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;
                String requestBody = "{\"applicationStatus\":\"REJECTED\",\"rejectionReason\":\"Ne répond pas aux critères\"}";

                doNothing().when(employerService).updateApplicationStatus(
                                eq(internshipOfferID),
                                eq(studentID),
                                eq(StudentApplication.ApplicationStatus.REJECTED),
                                eq("Ne répond pas aux critères"));

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                put(TestPaths.buildEmployerUpdateApplicationStatusUrl(internshipOfferID, studentID))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(requestBody))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
                String responseBody = mvcResult.getResponse().getContentAsString();
                assertThat(responseBody).contains("refusée avec succès");
                verify(employerService, times(1)).updateApplicationStatus(
                                eq(internshipOfferID),
                                eq(studentID),
                                eq(StudentApplication.ApplicationStatus.REJECTED),
                                eq("Ne répond pas aux critères"));
        }

        @Test
        @DisplayName("Test de PUT /api/employer/internship-offers/{internshipOfferID}/student-applications/{studentID}/status - candidature non trouvée")
        public void testUpdateApplicationStatus_NotFound() throws Exception {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 999L;
                String requestBody = "{\"applicationStatus\":\"APPROVED\"}";

                doThrow(new NoSuchElementException("Candidature non trouvée"))
                                .when(employerService).updateApplicationStatus(
                                                eq(internshipOfferID),
                                                eq(studentID),
                                                eq(StudentApplication.ApplicationStatus.APPROVED),
                                                nullable(String.class));

                // Act
                MvcResult mvcResult = mockMvc.perform(
                                put(TestPaths.buildEmployerUpdateApplicationStatusUrl(internshipOfferID, studentID))
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content(requestBody))
                                .andReturn();

                // Assert
                assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
                String responseBody = mvcResult.getResponse().getContentAsString();
                assertThat(responseBody).contains("Candidature non trouvée");
        }

    @Test
    @DisplayName("Test de PUT /api/employer/internship-offers/{internshipOfferID}/student-applications/{studentID}/status - le statut de l'application n'est pas APPROVED")
    public void testUpdateApplicationStatus_WrongApplicationStatus() throws Exception {
        // Arrange
        Long internshipOfferID = 1L;
        Long studentID = 999L;
        String requestBody = "{\"applicationStatus\":\"PENDING\"}";

        doThrow(new RuntimeException("Mauvais statut"))
            .when(employerService).updateApplicationStatus(
                eq(internshipOfferID),
                eq(studentID),
                eq(StudentApplication.ApplicationStatus.PENDING),
                nullable(String.class));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                put(TestPaths.buildEmployerUpdateApplicationStatusUrl(internshipOfferID, studentID))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        String responseBody = mvcResult.getResponse().getContentAsString();
        assertThat(responseBody).contains("Mauvais statut");
    }
}
