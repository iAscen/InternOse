package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.*;
import cal.ose.internose.service.DTOs.InterviewDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.ApplicationAlreadyReviewedException;
import cal.ose.internose.service.exceptions.InterviewAlreadyScheduledException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployerService Tests")
public class EmployerServiceTests {
        @Mock
        private EmployerDAO employerDAO;

        @Mock
        private StudentDAO studentDAO;

        @Mock
        private InternshipOfferDAO internshipOfferDAO;

        @Mock
        private StudentApplicationDAO studentApplicationDAO;

        @Mock
        private InterviewDAO interviewDAO;

        @InjectMocks
        private EmployerService employerService;

        @Test
        @DisplayName("Test de la méthode listInternshipOffers()")
        public void testListInternshipOffers() {
                // Arrange
                Long employerID = 1L;
                when(employerDAO.findById(anyLong())).thenReturn(Optional.of(exampleEmployer()));
                when(internshipOfferDAO.findAllByEmployer(any(Employer.class))).thenReturn(exampleInternshipOffers());
                // Act
                List<InternshipOfferDTO> internshipOfferDTOs = employerService.listInternshipOffers(employerID);
                // Assert
                assertThat(internshipOfferDTOs.size()).isEqualTo(1);
                verify(internshipOfferDAO, times(1)).findAllByEmployer(any(Employer.class));
        }

        @Test
        @DisplayName("Test de la méthode createInternshipOffer()")
        public void testCreateInternshipOffer() {
                // Arrange
                Long employerID = 1L;
                InternshipOffer internshipOffer = exampleInternshipOffers().getFirst();
                InternshipOfferDTO internshipOfferDTO = InternshipOfferDTO.fromEntity(internshipOffer);
                when(employerDAO.findById(anyLong())).thenReturn(Optional.of(exampleEmployer()));
                when(internshipOfferDAO.save(any(InternshipOffer.class))).thenReturn(internshipOffer);
                // Act
                Optional<InternshipOfferDTO> newInternshipOffer = Optional.ofNullable(employerService.createInternshipOffer(employerID,
                    internshipOfferDTO));
                // Assert
                assertThat(newInternshipOffer).isPresent();
                verify(internshipOfferDAO, times(1)).save(any(InternshipOffer.class));
        }

        @Test
        public void testGetStudentApplications() {
                Student student1 = Student.builder().id(1L).program("Z").build();
                Student student2 = Student.builder().id(2L).program("A").build();

                List<StudentApplication> applications = List.of(
                                StudentApplication.builder()
                                                .student(student1)
                                                .applicationDate(java.time.LocalDateTime.now())
                                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                                                .build(),
                                StudentApplication.builder()
                                                .student(student2)
                                                .applicationDate(java.time.LocalDateTime.now())
                                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                                                .build());

                when(internshipOfferDAO.findById(1L))
                                .thenReturn(Optional.of(InternshipOffer.builder().id(1L).build()));

                // Mock the actual DAO method used by the service to avoid generic inference issues
                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                                any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                                .thenReturn(applications);

                List<StudentDTO> studentDTOs = employerService.getStudentApplications(1L, null, null, null, "program");

                assertThat(studentDTOs.size()).isEqualTo(2);
                assertThat(studentDTOs.get(0).getProgram()).isEqualTo("A");
                assertThat(studentDTOs.get(1).getProgram()).isEqualTo("Z");
                assertThat(studentDTOs.get(0).getApplicationDate()).isNotNull();
                assertThat(studentDTOs.get(0).getApplicationStatus())
                                .isEqualTo(StudentApplication.ApplicationStatus.PENDING);
        }

        @Test
        public void testGetStudentApplications_EmptyList() {
                when(internshipOfferDAO.findById(1L))
                                .thenReturn(Optional.of(InternshipOffer.builder().id(1L).build()));

            when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                .thenReturn(new ArrayList<>());

                List<StudentDTO> studentDTOs = employerService.getStudentApplications(1L, null, null, null, "program");

                assertThat(studentDTOs.size()).isEqualTo(0);
        }

        @Test
        public void testGetStudentApplications_ThrowsNoSuchElementException() {
                when(internshipOfferDAO.findById(1L))
                                .thenReturn(Optional.empty());

                assertThrows(
                                NoSuchElementException.class,
                                () -> employerService.getStudentApplications(1L, null, null, null, null));

        }

        @Test
        public void testGetStudentApplicationDetails() {
                Student student = Student.builder()
                                .id(1L)
                                .firstName("John")
                                .lastName("Doe")
                                .program("Computer Science")
                                .institution("University")
                                .build();

                StudentApplication application = StudentApplication.builder()
                                .id(1L)
                                .student(student)
                                .applicationDate(java.time.LocalDateTime.now())
                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                                .build();

                when(internshipOfferDAO.findById(1L))
                                .thenReturn(Optional.of(InternshipOffer.builder().id(1L).build()));

            when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                .thenReturn(List.of(application));

                StudentDTO result = employerService.getStudentApplicationDetails(1L, 1L);

                assertThat(result.getId()).isEqualTo(1L);
                assertThat(result.getFirstName()).isEqualTo("John");
                assertThat(result.getLastName()).isEqualTo("Doe");
                assertThat(result.getApplicationStatus()).isEqualTo(StudentApplication.ApplicationStatus.PENDING);
        }

        @Test
        public void testGetStudentApplicationDetails_ThrowsResourceNotFoundException() {
                when(internshipOfferDAO.findById(1L))
                                .thenReturn(Optional.of(InternshipOffer.builder().id(1L).build()));

            when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                .thenReturn(List.of());

                assertThrows(
                                NoSuchElementException.class,
                                () -> employerService.getStudentApplicationDetails(1L, 1L));
        }

        private Employer exampleEmployer() {
                return Employer.builder()
                                .firstName("Artyom")
                                .lastName("M.")
                                .company("Artyom Tech Inc.")
                                .build();
        }

        private List<InternshipOffer> exampleInternshipOffers() {
                List<InternshipOffer> internshipOffers = new ArrayList<>();
                internshipOffers.add(
                                InternshipOffer.builder()
                                                .title("Ingénieur logiciel junior chez Artyom Tech Inc.")
                                                .description("*description ici*")
                                                .program("Technique de l'informatique")
                                                .requiredSkills("*compétences requises ici*")
                                                .duration(6)
                                                .startDate(LocalDate.of(2026, 1, 23))
                                                .salary(25.0)
                                                .address("*adresse du stage ici*")
                                                .build());
                return internshipOffers;
        }


        private InternshipOffer offerWithStatus(Long id) {
                return InternshipOffer.builder()
                                .id(id)
                                .verificationStatus(VerificationStatus.APPROVED)
                                .build();
        }

        private Student studentWithResumeStatus(Long id) {
                return Student.builder()
                                .id(id)
                                .resumeVerificationStatus(VerificationStatus.APPROVED)
                                .build();
        }

        private StudentApplication applicationWithStatus(Long id,
                                                         InternshipOffer offer,
                                                         Student student,
                                                         StudentApplication.ApplicationStatus status) {
                return StudentApplication.builder()
                                .id(id)
                                .internshipOffer(offer)
                                .student(student)
                                .applicationStatus(status)
                                .build();
        }

        private void stubOfferAndSingleApplication(InternshipOffer offer, StudentApplication application) {
                when(internshipOfferDAO.findById(offer.getId())).thenReturn(Optional.of(offer));
                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                                any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                                .thenReturn(List.of(application));
        }

        @Test
        @DisplayName("Test de la méthode scheduleInterview() - succès")
        public void testScheduleInterview() throws InterviewAlreadyScheduledException {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;

                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
                Student student = Student.builder().id(studentID).firstName("John").lastName("Doe").build();
                StudentApplication application = StudentApplication.builder()
                                .id(1L)
                                .student(student)
                                .internshipOffer(internshipOffer)
                                .applicationDate(LocalDateTime.now())
                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                                .build();

                InterviewDTO interviewDTO = InterviewDTO.builder()
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Nous sommes ravis de vous rencontrer")
                                .build();

                Interview savedInterview = Interview.builder()
                                .id(1L)
                                .studentApplication(application)
                                .interviewDate(interviewDTO.getInterviewDate())
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location(interviewDTO.getLocation())
                                .personalizedMessage(interviewDTO.getPersonalizedMessage())
                                .interviewStatus(Interview.InterviewStatus.SCHEDULED)
                                .build();

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                    any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                    .thenReturn(List.of(application));
                when(interviewDAO.existsByStudentApplication(application)).thenReturn(false);
                when(interviewDAO.save(any(Interview.class))).thenReturn(savedInterview);

                // Act
                InterviewDTO result = employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO);

                // Assert
                assertThat(result).isNotNull();
                assertThat(result.getId()).isEqualTo(1L);
                assertThat(result.getStudentID()).isEqualTo(studentID);
                assertThat(result.getInterviewMode()).isEqualTo(Interview.InterviewMode.ONLINE);
                assertThat(result.getLocation()).isEqualTo("https://zoom.us/meeting");
                verify(interviewDAO, times(1)).save(any(Interview.class));
        }

        @Test
        @DisplayName("Test de la méthode scheduleInterview() - offre non trouvée")
        public void testScheduleInterview_OfferNotFound() {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;
                InterviewDTO interviewDTO = InterviewDTO.builder()
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Message")
                                .build();

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.empty());

                // Act & Assert
                assertThrows(
                                NoSuchElementException.class,
                                () -> employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO));
                verify(interviewDAO, never()).save(any(Interview.class));
        }

        @Test
        @DisplayName("Test de la méthode scheduleInterview() - candidature non trouvée")
        public void testScheduleInterview_ApplicationNotFound() {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;
                InterviewDTO interviewDTO = InterviewDTO.builder()
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Message")
                                .build();

                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                    any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                    .thenReturn(new ArrayList<>());

                // Act & Assert
                assertThrows(
                                NoSuchElementException.class,
                                () -> employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO));
                verify(interviewDAO, never()).save(any(Interview.class));
        }

        @Test
        @DisplayName("Test de la méthode scheduleInterview() - entrevue déjà existante")
        public void testScheduleInterview_InterviewAlreadyExists() {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;

                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
                Student student = Student.builder().id(studentID).build();
                StudentApplication application = StudentApplication.builder()
                                .id(1L)
                                .student(student)
                                .internshipOffer(internshipOffer)
                                .build();

                InterviewDTO interviewDTO = InterviewDTO.builder()
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Message")
                                .build();

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                    any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                    .thenReturn(List.of(application));
                when(interviewDAO.existsByStudentApplication(application)).thenReturn(true);

                // Act & Assert
                assertThrows(
                                InterviewAlreadyScheduledException.class,
                                () -> employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO));
                verify(interviewDAO, never()).save(any(Interview.class));
        }

        @Test
        @DisplayName("Test de la méthode getInterviewsByEmployer()")
        public void testGetInterviewsByEmployer() {
                // Arrange
                Long employerID = 1L;
                Employer employer = exampleEmployer();
                employer.setId(employerID);

                InternshipOffer internshipOffer = InternshipOffer.builder()
                                .id(1L)
                                .employer(employer)
                                .title("Stage développeur")
                                .build();

                Student student = Student.builder()
                                .id(1L)
                                .firstName("John")
                                .lastName("Doe")
                                .build();

                StudentApplication application = StudentApplication.builder()
                                .id(1L)
                                .student(student)
                                .internshipOffer(internshipOffer)
                                .build();

                Interview interview = Interview.builder()
                                .id(1L)
                                .studentApplication(application)
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.ONLINE)
                                .location("https://zoom.us/meeting")
                                .personalizedMessage("Message personnalisé")
                                .interviewStatus(Interview.InterviewStatus.SCHEDULED)
                                .build();

                when(employerDAO.findById(employerID)).thenReturn(Optional.of(employer));
                when(interviewDAO.findAllByStudentApplicationInternshipOfferEmployer(employer)).thenReturn(List.of(interview));

                // Act
                List<InterviewDTO> result = employerService.getInterviewsByEmployer(employerID);

                // Assert
                assertThat(result.size()).isEqualTo(1);
                assertThat(result.getFirst().getId()).isEqualTo(1L);
                assertThat(result.getFirst().getStudentFirstName()).isEqualTo("John");
                assertThat(result.getFirst().getStudentLastName()).isEqualTo("Doe");
                assertThat(result.getFirst().getInterviewMode()).isEqualTo(Interview.InterviewMode.ONLINE);
                verify(interviewDAO, times(1)).findAllByStudentApplicationInternshipOfferEmployer(employer);
        }

        @Test
        @DisplayName("Test de la méthode getInterviewsByEmployer() - employeur non trouvé")
        public void testGetInterviewsByEmployer_EmployerNotFound() {
                // Arrange
                Long employerID = 1L;
                when(employerDAO.findById(employerID)).thenReturn(Optional.empty());

                // Act & Assert
                assertThrows(
                                NoSuchElementException.class,
                                () -> employerService.getInterviewsByEmployer(employerID));
                verify(interviewDAO, never()).findAllByStudentApplicationInternshipOfferEmployer(any(Employer.class));
        }

        @Test
        @DisplayName("Test de la méthode getInterviewByApplication()")
        public void testGetInterviewByApplication() {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;

                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
                Student student = Student.builder().id(studentID).firstName("John").lastName("Doe").build();
                StudentApplication application = StudentApplication.builder()
                                .id(1L)
                                .student(student)
                                .internshipOffer(internshipOffer)
                                .build();

                Interview interview = Interview.builder()
                                .id(1L)
                                .studentApplication(application)
                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                                .interviewMode(Interview.InterviewMode.IN_PERSON)
                                .location("123 Main St")
                                .personalizedMessage("Message personnalisé")
                                .interviewStatus(Interview.InterviewStatus.SCHEDULED)
                                .build();

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
                when(interviewDAO.findByStudentApplication(application)).thenReturn(Optional.of(interview));

                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                    any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                    .thenReturn(List.of(application));

                // Act
                Optional<InterviewDTO> result = employerService.getInterviewByApplication(internshipOfferID, studentID);


                // Assert
                assertTrue(result.isPresent());
                assertEquals(1L, result.get().getId());
                assertEquals(Interview.InterviewMode.IN_PERSON, result.get().getInterviewMode());
                assertEquals("123 Main St", result.get().getLocation());
                 verify(interviewDAO, times(1)).findByStudentApplication(application);
        }

        @Test
        @DisplayName("Test de la méthode updateApplicationStatus() - accepter candidature")
        public void testUpdateApplicationStatus_Approve() {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;

                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
                Student student = Student.builder().id(studentID).build();
                StudentApplication application = StudentApplication.builder()
                                .id(1L)
                                .student(student)
                                .internshipOffer(internshipOffer)
                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                                .build();

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                    any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                    .thenReturn(List.of(application));
                when(studentApplicationDAO.save(any(StudentApplication.class))).thenReturn(application);

                // Act
                employerService.updateApplicationStatus(
                    internshipOfferID,
                    studentID,
                    StudentApplication.ApplicationStatus.APPROVED,
                    null
                );

                // Assert
                verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
                assertThat(application.getApplicationStatus()).isEqualTo(StudentApplication.ApplicationStatus.APPROVED);
        }

        @Test
        @DisplayName("Test de la méthode updateApplicationStatus() - refuser candidature")
        public void testUpdateApplicationStatus_Reject() {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 1L;
                String rejectionReason = "Ne répond pas aux critères";

                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
                Student student = Student.builder().id(studentID).build();
                StudentApplication application = StudentApplication.builder()
                                .id(1L)
                                .student(student)
                                .internshipOffer(internshipOffer)
                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                                .build();

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                    any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                    .thenReturn(List.of(application));
                when(studentApplicationDAO.save(any(StudentApplication.class))).thenReturn(application);

                // Act
                employerService.updateApplicationStatus(
                    internshipOfferID,
                    studentID,
                    StudentApplication.ApplicationStatus.REJECTED,
                    rejectionReason
                );

                // Assert
                verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
                assertThat(application.getApplicationStatus()).isEqualTo(StudentApplication.ApplicationStatus.REJECTED);
        }

        @Test
        @DisplayName("Test de la méthode updateApplicationStatus() - offre non trouvée")
        public void testUpdateApplicationStatus_OfferNotFound() {
                // Arrange
                Long internshipOfferID = 999L;
                Long studentID = 1L;

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.empty());

                // Act & Assert
                assertThrows(
                                NoSuchElementException.class,
                                () -> employerService.updateApplicationStatus(
                                    internshipOfferID,
                                    studentID,
                                    StudentApplication.ApplicationStatus.APPROVED,
                                    null
                                ));
                verify(studentApplicationDAO, never()).save(any(StudentApplication.class));
        }

        @Test
        @DisplayName("Test de la méthode updateApplicationStatus() - candidature non trouvée")
        public void testUpdateApplicationStatus_ApplicationNotFound() {
                // Arrange
                Long internshipOfferID = 1L;
                Long studentID = 999L;

                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();

                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
                when(studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
                    any(InternshipOffer.class), eq(null), eq(null), eq(null)))
                    .thenReturn(new ArrayList<>());

                // Act & Assert
                assertThrows(
                                NoSuchElementException.class,
                                () -> employerService.updateApplicationStatus(
                                    internshipOfferID,
                                    studentID,
                                    StudentApplication.ApplicationStatus.APPROVED,
                                    null
                                ));
                verify(studentApplicationDAO, never()).save(any(StudentApplication.class));
        }

        @Test
        @DisplayName("Test de la methode countUnseenApplications() - offre non trouvee")
        public void testCountUnseenApplications_OfferNotFound() {
            // Arrange
            when(internshipOfferDAO.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NoSuchElementException.class, () -> employerService.countUnseenApplications(1L));
        }

        @Test
        @DisplayName("Test de la methode countUnseenApplications()")
        public void testCountUnseenApplications() {
            // Arrange
            InternshipOffer internshipOffer1 = InternshipOffer.builder().id(1L).build();

            when(internshipOfferDAO.findById(1L)).thenReturn(Optional.ofNullable(internshipOffer1));
            when(studentApplicationDAO.findByInternshipOffer(internshipOffer1)).thenReturn(
                studentApplicationsTestList()
            );

            // Act
            Map<String, Integer> unseenApplications = employerService.countUnseenApplications(1L);

            // Assert
            assertEquals(2, unseenApplications.size());
            assertEquals(1, unseenApplications.get("studentsWhoRejectedTheOffer"));
            assertEquals(1, unseenApplications.get("studentsWhoAcceptedTheOffer"));
        }

        @Test
        @DisplayName("Test de la methode makeApplicationsSeen() - offre non trouvee")
        public void testMakeApplicationsSeen_OfferNotFound() {
            // Arrange
            when(internshipOfferDAO.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(NoSuchElementException.class, () -> employerService.makeApplicationsSeen(1L));
        }

        @Test
        @DisplayName("Test de la methode makeApplicationsSeen()")
        public void testMakeApplicationsSeen() {
            // Arrange
            List<StudentApplication> studentApplications = studentApplicationsTestList();

            InternshipOffer internshipOffer1 = InternshipOffer.builder().id(1L).build();

            when(internshipOfferDAO.findById(1L)).thenReturn(Optional.ofNullable(internshipOffer1));
            when(studentApplicationDAO.findByInternshipOffer(internshipOffer1)).thenReturn(
                studentApplications
            );

            // Act
            employerService.makeApplicationsSeen(1L);

            // Assert
            verify(studentApplicationDAO, times(2)).save(any(StudentApplication.class));
        }

        private List<StudentApplication> studentApplicationsTestList() {
            StudentApplication studentApplication1 = StudentApplication.builder()
                .id(1L)
                .applicationStatus(StudentApplication.ApplicationStatus.REJECTED_BY_STUDENT)
                .seenStatus(StudentApplication.SeenStatus.UNSEEN).build();

            StudentApplication studentApplication2  = StudentApplication.builder()
                .id(1L)
                .applicationStatus(StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT)
                .seenStatus(StudentApplication.SeenStatus.UNSEEN).build();

            StudentApplication studentApplication3 = StudentApplication.builder()
                .id(1L)
                .applicationStatus(StudentApplication.ApplicationStatus.REJECTED_BY_STUDENT)
                .seenStatus(StudentApplication.SeenStatus.SEEN).build();

            StudentApplication studentApplication4 = StudentApplication.builder()
                .id(1L)
                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
                .seenStatus(StudentApplication.SeenStatus.NONE).build();

            ArrayList<StudentApplication> studentApplicationsTestList = new ArrayList<>();
            studentApplicationsTestList.add(studentApplication1);
            studentApplicationsTestList.add(studentApplication2);
            studentApplicationsTestList.add(studentApplication3);
            studentApplicationsTestList.add(studentApplication4);

            return studentApplicationsTestList;
        }

        @Test
        @DisplayName("Test approver une application happy day scenario")
        public void testApproveApplication() {
            // Arrange
            Long internshipOfferID = 1L;
            Long studentID = 1L;
            Long studentApplicationID = 1L;

            InternshipOffer internshipOffer = offerWithStatus(internshipOfferID);
            Student student = studentWithResumeStatus(studentID);
            StudentApplication application = applicationWithStatus(
                            studentApplicationID,
                            internshipOffer,
                            student,
                            StudentApplication.ApplicationStatus.PENDING_INTERVIEW);

            stubOfferAndSingleApplication(internshipOffer, application);
            when(studentApplicationDAO.save(any(StudentApplication.class))).thenReturn(application);

            // Act
            employerService.reviewApplication(internshipOfferID, studentID, true, "");

            // Assert
            assertThat(application.getApplicationStatus()).isEqualTo(StudentApplication.ApplicationStatus.APPROVED);
            verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
        }

        @Test
        @DisplayName("Test rejeter une application happy day scenario")
        public void testRejectApplication() {
            // Arrange
            Long internshipOfferID = 1L;
            Long studentID = 1L;
            Long studentApplicationID = 1L;

            InternshipOffer internshipOffer = offerWithStatus(internshipOfferID);
            Student student = studentWithResumeStatus(studentID);
            StudentApplication application = applicationWithStatus(
                            studentApplicationID,
                            internshipOffer,
                            student,
                            StudentApplication.ApplicationStatus.PENDING_INTERVIEW);

            stubOfferAndSingleApplication(internshipOffer, application);
            when(studentApplicationDAO.save(any(StudentApplication.class))).thenReturn(application);

            // Act
            employerService.reviewApplication(internshipOfferID, studentID, false, "Compétences insuffisantes");

            // Assert
            assertThat(application.getApplicationStatus()).isEqualTo(StudentApplication.ApplicationStatus.REJECTED);
            verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
        }

        @Test
        @DisplayName("Test reviewApplication candidature ou offre non trouvée")
        public void testReviewApplication_Throws_NoSuchElementException() {
            try {
                employerService.reviewApplication(1L, 1L, true, "");
            } catch (NoSuchElementException e) {
                assertThat(e.getMessage()).isEqualTo("No value present");
            }
        }

        @Test
        @DisplayName("Test reviewApplication avec statut PENDING - accepter candidature")
        public void testReviewApplication_WithPendingStatus_Accept() {
            // Arrange
            Long internshipOfferID = 1L;
            Long studentID = 1L;
            Long studentApplicationID = 1L;

            InternshipOffer internshipOffer = offerWithStatus(internshipOfferID);
            Student student = studentWithResumeStatus(studentID);
            StudentApplication application = applicationWithStatus(
                            studentApplicationID,
                            internshipOffer,
                            student,
                            StudentApplication.ApplicationStatus.PENDING);

            stubOfferAndSingleApplication(internshipOffer, application);
            when(studentApplicationDAO.save(any(StudentApplication.class))).thenReturn(application);

            // Act
            employerService.reviewApplication(1L, 1L, true, "");

            // Assert
            assertThat(application.getApplicationStatus()).isEqualTo(StudentApplication.ApplicationStatus.APPROVED);
            verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
        }

        @Test
        @DisplayName("Test reviewApplication avec statut PENDING - refuser candidature")
        public void testReviewApplication_WithPendingStatus_Reject() {
            // Arrange
            Long internshipOfferID = 1L;
            Long studentID = 1L;
            Long studentApplicationID = 1L;
            String rejectionReason = "Compétences insuffisantes";

            InternshipOffer internshipOffer = offerWithStatus(internshipOfferID);
            Student student = studentWithResumeStatus(studentID);
            StudentApplication application = applicationWithStatus(
                            studentApplicationID,
                            internshipOffer,
                            student,
                            StudentApplication.ApplicationStatus.PENDING);

            stubOfferAndSingleApplication(internshipOffer, application);
            when(studentApplicationDAO.save(any(StudentApplication.class))).thenReturn(application);

            // Act
            employerService.reviewApplication(1L, 1L, false, rejectionReason);

            // Assert
            assertThat(application.getApplicationStatus()).isEqualTo(StudentApplication.ApplicationStatus.REJECTED);
            assertThat(application.getRejectionReason()).isEqualTo(rejectionReason);
            verify(studentApplicationDAO, times(1)).save(any(StudentApplication.class));
        }

        @Test
        @DisplayName("Test reviewApplication application déjà examinée")
        public void testReviewApplication_Throws_ApplicationAlreadyReviewedException() {
            // Arrange
            Long internshipOfferID = 1L;
            Long studentID = 1L;
            Long studentApplicationID = 1L;

            InternshipOffer internshipOffer = offerWithStatus(internshipOfferID);
            Student student = studentWithResumeStatus(studentID);
            StudentApplication application = applicationWithStatus(
                            studentApplicationID,
                            internshipOffer,
                            student,
                            StudentApplication.ApplicationStatus.APPROVED);

            stubOfferAndSingleApplication(internshipOffer, application);

            // Act & Assert
            try {
                employerService.reviewApplication(1L, 1L, true, "");
            } catch (ApplicationAlreadyReviewedException e) {
                assertThat(e.getMessage()).isEqualTo("Cette application est déjà examinée.");
            }
        }
}
