//package cal.ose.internose.service;
//
//import cal.ose.internose.modele.*;
//import cal.ose.internose.persistance.EmployerDAO;
//import cal.ose.internose.persistance.InterviewDAO;
//import cal.ose.internose.persistance.InternshipOfferDAO;
//import cal.ose.internose.persistance.StudentDAO;
//import cal.ose.internose.persistance.StudentApplicationDAO;
//import cal.ose.internose.security.exceptions.ResourceNotFoundException;
//import cal.ose.internose.service.DTOs.InterviewDTO;
//import cal.ose.internose.service.DTOs.InternshipOfferDTO;
//import cal.ose.internose.service.DTOs.StudentDTO;
//import cal.ose.internose.service.exceptions.InterviewAlreadyScheduledException;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//@DisplayName("EmployerService Tests")
//public class EmployerServiceTests {
//        @Mock
//        private EmployerDAO employerDAO;
//
//        @Mock
//        private InternshipOfferDAO internshipOfferDAO;
//
//        @Mock
//        private StudentDAO studentDAO;
//
//        @Mock
//        private StudentApplicationDAO studentApplicationDAO;
//
//        @Mock
//        private InterviewDAO interviewDAO;
//
//        @InjectMocks
//        private EmployerService employerService;
//
//        @Test
//        @DisplayName("Test de la méthode listInternshipOffers()")
//        public void testListInternshipOffers() throws ResourceNotFoundException {
//                // Arrange
//                Long employerID = 1L;
//                when(employerDAO.findById(anyLong())).thenReturn(Optional.of(exampleEmployer()));
//                when(internshipOfferDAO.findAllByEmployer(any(Employer.class))).thenReturn(exampleInternshipOffers());
//                // Act
//                List<InternshipOfferDTO> internshipOfferDTOs = employerService.listInternshipOffers(employerID);
//                // Assert
//                assertThat(internshipOfferDTOs.size()).isEqualTo(1);
//                verify(internshipOfferDAO, times(1)).findAllByEmployer(any(Employer.class));
//        }
//
//        @Test
//        @DisplayName("Test de la méthode createInternshipOffer()")
//        public void testCreateInternshipOffer() throws ResourceNotFoundException {
//                // Arrange
//                Long employerID = 1L;
//                InternshipOffer internshipOffer = exampleInternshipOffers().getFirst();
//                InternshipOfferDTO internshipOfferDTO = InternshipOfferDTO.fromEntity(internshipOffer);
//                when(employerDAO.findById(anyLong())).thenReturn(Optional.of(exampleEmployer()));
//                when(internshipOfferDAO.save(any(InternshipOffer.class))).thenReturn(internshipOffer);
//                // Act
//                Optional<InternshipOfferDTO> newInternshipOffer = employerService.createInternshipOffer(employerID,
//                                internshipOfferDTO);
//                // Assert
//                assertThat(newInternshipOffer).isPresent();
//                verify(internshipOfferDAO, times(1)).save(any(InternshipOffer.class));
//        }
//
//        @Test
//        public void testGetStudentApplications() throws ResourceNotFoundException {
//                Student student1 = Student.builder().id(1L).program("Z").build();
//                Student student2 = Student.builder().id(2L).program("A").build();
//
//                List<StudentApplication> applications = List.of(
//                                StudentApplication.builder()
//                                                .student(student1)
//                                                .applicationDate(java.time.LocalDateTime.now())
//                                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
//                                                .build(),
//                                StudentApplication.builder()
//                                                .student(student2)
//                                                .applicationDate(java.time.LocalDateTime.now())
//                                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
//                                                .build());
//
//                when(internshipOfferDAO.findById(1L))
//                                .thenReturn(Optional.of(InternshipOffer.builder().id(1L).build()));
//
//                when(studentApplicationDAO.findBy(1L, null, null, null))
//                                .thenReturn(applications);
//
//                List<StudentDTO> studentDTOs = employerService.getStudentApplications(1L, null, null, null, "program");
//
//                assertThat(studentDTOs.size()).isEqualTo(2);
//                assertThat(studentDTOs.get(0).getProgram()).isEqualTo("A");
//                assertThat(studentDTOs.get(1).getProgram()).isEqualTo("Z");
//                assertThat(studentDTOs.get(0).getApplicationDate()).isNotNull();
//                assertThat(studentDTOs.get(0).getApplicationStatus())
//                                .isEqualTo(StudentApplication.ApplicationStatus.PENDING);
//        }
//
//        @Test
//        public void testGetStudentApplications_EmptyList() throws ResourceNotFoundException {
//                when(internshipOfferDAO.findById(1L))
//                                .thenReturn(Optional.of(InternshipOffer.builder().id(1L).build()));
//
//                when(studentApplicationDAO.findBy(1L, null, null, null))
//                                .thenReturn(new ArrayList<>());
//
//                List<StudentDTO> studentDTOs = employerService.getStudentApplications(1L, null, null, null, "program");
//
//                assertThat(studentDTOs.size()).isEqualTo(0);
//        }
//
//        @Test
//        public void testGetStudentApplications_ThrowsResourceNotFoundException() {
//                when(internshipOfferDAO.findById(1L))
//                                .thenReturn(Optional.empty());
//
//                assertThrows(
//                                ResourceNotFoundException.class,
//                                () -> employerService.getStudentApplications(1L, null, null, null, null));
//
//        }
//
//        @Test
//        public void testGetStudentApplicationDetails() throws ResourceNotFoundException {
//                Student student = Student.builder()
//                                .id(1L)
//                                .firstName("John")
//                                .lastName("Doe")
//                                .program("Computer Science")
//                                .institution("University")
//                                .build();
//
//                StudentApplication application = StudentApplication.builder()
//                                .id(1L)
//                                .student(student)
//                                .applicationDate(java.time.LocalDateTime.now())
//                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
//                                .build();
//
//                when(internshipOfferDAO.findById(1L))
//                                .thenReturn(Optional.of(InternshipOffer.builder().id(1L).build()));
//
//                when(studentApplicationDAO.findBy(1L, null, null, null))
//                                .thenReturn(List.of(application));
//
//                StudentDTO result = employerService.getStudentApplicationDetails(1L, 1L);
//
//                assertThat(result.getId()).isEqualTo(1L);
//                assertThat(result.getFirstName()).isEqualTo("John");
//                assertThat(result.getLastName()).isEqualTo("Doe");
//                assertThat(result.getApplicationStatus()).isEqualTo(StudentApplication.ApplicationStatus.PENDING);
//        }
//
//        @Test
//        public void testGetStudentApplicationDetails_ThrowsResourceNotFoundException() {
//                when(internshipOfferDAO.findById(1L))
//                                .thenReturn(Optional.of(InternshipOffer.builder().id(1L).build()));
//
//                when(studentApplicationDAO.findBy(1L, null, null, null))
//                                .thenReturn(List.of());
//
//                assertThrows(
//                                ResourceNotFoundException.class,
//                                () -> employerService.getStudentApplicationDetails(1L, 1L));
//        }
//
//        private Employer exampleEmployer() {
//                return Employer.builder()
//                                .firstName("Artyom")
//                                .lastName("M.")
//                                .company("Artyom Tech Inc.")
//                                .build();
//        }
//
//        private List<InternshipOffer> exampleInternshipOffers() {
//                List<InternshipOffer> internshipOffers = new ArrayList<>();
//                internshipOffers.add(
//                                InternshipOffer.builder()
//                                                .title("Ingénieur logiciel junior chez Artyom Tech Inc.")
//                                                .description("*description ici*")
//                                                .program("Technique de l'informatique")
//                                                .requiredSkills("*compétences requises ici*")
//                                                .duration(6)
//                                                .startDate(LocalDate.of(2026, 1, 23))
//                                                .salary(25.0)
//                                                .address("*adresse du stage ici*")
//                                                .build());
//                return internshipOffers;
//        }
//
//        @Test
//        @DisplayName("Test de la méthode scheduleInterview() - succès")
//        public void testScheduleInterview() throws ResourceNotFoundException, InterviewAlreadyScheduledException {
//                // Arrange
//                Long internshipOfferID = 1L;
//                Long studentID = 1L;
//
//                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
//                Student student = Student.builder().id(studentID).firstName("John").lastName("Doe").build();
//                StudentApplication application = StudentApplication.builder()
//                                .id(1L)
//                                .student(student)
//                                .internshipOffer(internshipOffer)
//                                .applicationDate(LocalDateTime.now())
//                                .applicationStatus(StudentApplication.ApplicationStatus.PENDING)
//                                .build();
//
//                InterviewDTO interviewDTO = InterviewDTO.builder()
//                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
//                                .interviewMode("ONLINE")
//                                .location("https://zoom.us/meeting")
//                                .personalizedMessage("Nous sommes ravis de vous rencontrer")
//                                .build();
//
//                Interview savedInterview = Interview.builder()
//                                .id(1L)
//                                .studentApplication(application)
//                                .interviewDateTime(interviewDTO.getInterviewDate())
//                                .interviewMode(Interview.InterviewMode.ONLINE)
//                                .location(interviewDTO.getLocation())
//                                .personalizedMessage(interviewDTO.getPersonalizedMessage())
//                                .status(Interview.InterviewStatus.SCHEDULED)
//                                .createdAt(LocalDateTime.now())
//                                .build();
//
//                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
//                when(studentApplicationDAO.findBy(internshipOfferID, null, null, null))
//                                .thenReturn(List.of(application));
//                when(interviewDAO.existsByStudentApplication(application.getId())).thenReturn(false);
//                when(interviewDAO.save(any(Interview.class))).thenReturn(savedInterview);
//
//                // Act
//                InterviewDTO result = employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO);
//
//                // Assert
//                assertThat(result).isNotNull();
//                assertThat(result.getId()).isEqualTo(1L);
//                assertThat(result.getStudentID()).isEqualTo(studentID);
//                assertThat(result.getInterviewMode()).isEqualTo("ONLINE");
//                assertThat(result.getLocation()).isEqualTo("https://zoom.us/meeting");
//                verify(interviewDAO, times(1)).save(any(Interview.class));
//        }
//
//        @Test
//        @DisplayName("Test de la méthode scheduleInterview() - offre non trouvée")
//        public void testScheduleInterview_OfferNotFound() {
//                // Arrange
//                Long internshipOfferID = 1L;
//                Long studentID = 1L;
//                InterviewDTO interviewDTO = InterviewDTO.builder()
//                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
//                                .interviewMode("ONLINE")
//                                .location("https://zoom.us/meeting")
//                                .personalizedMessage("Message")
//                                .build();
//
//                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.empty());
//
//                // Act & Assert
//                assertThrows(
//                                ResourceNotFoundException.class,
//                                () -> employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO));
//                verify(interviewDAO, never()).save(any(Interview.class));
//        }
//
//        @Test
//        @DisplayName("Test de la méthode scheduleInterview() - candidature non trouvée")
//        public void testScheduleInterview_ApplicationNotFound() {
//                // Arrange
//                Long internshipOfferID = 1L;
//                Long studentID = 1L;
//                InterviewDTO interviewDTO = InterviewDTO.builder()
//                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
//                                .interviewMode("ONLINE")
//                                .location("https://zoom.us/meeting")
//                                .personalizedMessage("Message")
//                                .build();
//
//                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
//
//                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
//                when(studentApplicationDAO.findBy(internshipOfferID, null, null, null))
//                                .thenReturn(new ArrayList<>());
//
//                // Act & Assert
//                assertThrows(
//                                ResourceNotFoundException.class,
//                                () -> employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO));
//                verify(interviewDAO, never()).save(any(Interview.class));
//        }
//
//        @Test
//        @DisplayName("Test de la méthode scheduleInterview() - entrevue déjà existante")
//        public void testScheduleInterview_InterviewAlreadyExists() {
//                // Arrange
//                Long internshipOfferID = 1L;
//                Long studentID = 1L;
//
//                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
//                Student student = Student.builder().id(studentID).build();
//                StudentApplication application = StudentApplication.builder()
//                                .id(1L)
//                                .student(student)
//                                .internshipOffer(internshipOffer)
//                                .build();
//
//                InterviewDTO interviewDTO = InterviewDTO.builder()
//                                .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
//                                .interviewMode("ONLINE")
//                                .location("https://zoom.us/meeting")
//                                .personalizedMessage("Message")
//                                .build();
//
//                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
//                when(studentApplicationDAO.findBy(internshipOfferID, null, null, null))
//                                .thenReturn(List.of(application));
//                when(interviewDAO.existsByStudentApplication(application.getId())).thenReturn(true);
//
//                // Act & Assert
//                assertThrows(
//                                InterviewAlreadyScheduledException.class,
//                                () -> employerService.scheduleInterview(internshipOfferID, studentID, interviewDTO));
//                verify(interviewDAO, never()).save(any(Interview.class));
//        }
//
//        @Test
//        @DisplayName("Test de la méthode getInterviewsByEmployer()")
//        public void testGetInterviewsByEmployer() throws ResourceNotFoundException {
//                // Arrange
//                Long employerID = 1L;
//                Employer employer = exampleEmployer();
//                employer.setId(employerID);
//
//                InternshipOffer internshipOffer = InternshipOffer.builder()
//                                .id(1L)
//                                .employer(employer)
//                                .title("Stage développeur")
//                                .build();
//
//                Student student = Student.builder()
//                                .id(1L)
//                                .firstName("John")
//                                .lastName("Doe")
//                                .build();
//
//                StudentApplication application = StudentApplication.builder()
//                                .id(1L)
//                                .student(student)
//                                .internshipOffer(internshipOffer)
//                                .build();
//
//                Interview interview = Interview.builder()
//                                .id(1L)
//                                .studentApplication(application)
//                                .interviewDateTime(LocalDateTime.of(2024, 12, 15, 14, 30))
//                                .interviewMode(Interview.InterviewMode.ONLINE)
//                                .location("https://zoom.us/meeting")
//                                .personalizedMessage("Message personnalisé")
//                                .status(Interview.InterviewStatus.SCHEDULED)
//                                .createdAt(LocalDateTime.now())
//                                .build();
//
//                when(employerDAO.findById(employerID)).thenReturn(Optional.of(employer));
//                when(interviewDAO.findAllByStudentApplicationInternshipOfferEmployer(employerID)).thenReturn(List.of(interview));
//
//                // Act
//                List<InterviewDTO> result = employerService.getInterviewsByEmployer(employerID);
//
//                // Assert
//                assertThat(result.size()).isEqualTo(1);
//                assertThat(result.get(0).getId()).isEqualTo(1L);
//                assertThat(result.get(0).getStudentFirstName()).isEqualTo("John");
//                assertThat(result.get(0).getStudentLastName()).isEqualTo("Doe");
//                assertThat(result.get(0).getInterviewMode()).isEqualTo("ONLINE");
//                verify(interviewDAO, times(1)).findAllByStudentApplicationInternshipOfferEmployer(employerID);
//        }
//
//        @Test
//        @DisplayName("Test de la méthode getInterviewsByEmployer() - employeur non trouvé")
//        public void testGetInterviewsByEmployer_EmployerNotFound() {
//                // Arrange
//                Long employerID = 1L;
//                when(employerDAO.findById(employerID)).thenReturn(Optional.empty());
//
//                // Act & Assert
//                assertThrows(
//                                ResourceNotFoundException.class,
//                                () -> employerService.getInterviewsByEmployer(employerID));
//                verify(interviewDAO, never()).findAllByStudentApplicationInternshipOfferEmployer(anyLong());
//        }
//
//        @Test
//        @DisplayName("Test de la méthode getInterviewByApplication()")
//        public void testGetInterviewByApplication() throws ResourceNotFoundException {
//                // Arrange
//                Long internshipOfferID = 1L;
//                Long studentID = 1L;
//
//                InternshipOffer internshipOffer = InternshipOffer.builder().id(internshipOfferID).build();
//                Student student = Student.builder().id(studentID).firstName("John").lastName("Doe").build();
//                StudentApplication application = StudentApplication.builder()
//                                .id(1L)
//                                .student(student)
//                                .internshipOffer(internshipOffer)
//                                .build();
//
//                Interview interview = Interview.builder()
//                                .id(1L)
//                                .studentApplication(application)
//                                .interviewDateTime(LocalDateTime.of(2024, 12, 15, 14, 30))
//                                .interviewMode(Interview.InterviewMode.IN_PERSON)
//                                .location("123 Main St")
//                                .personalizedMessage("Message personnalisé")
//                                .status(Interview.InterviewStatus.SCHEDULED)
//                                .createdAt(LocalDateTime.now())
//                                .build();
//
//                when(internshipOfferDAO.findById(internshipOfferID)).thenReturn(Optional.of(internshipOffer));
//                when(studentApplicationDAO.findBy(internshipOfferID, null, null, null))
//                                .thenReturn(List.of(application));
//                when(interviewDAO.findByStudentApplication(application.getId())).thenReturn(Optional.of(interview));
//
//                // Act
//                Optional<InterviewDTO> result = employerService.getInterviewByApplication(internshipOfferID, studentID);
//
//                // Assert
//                assertThat(result.isPresent()).isTrue();
//                assertThat(result.get().getId()).isEqualTo(1L);
//                assertThat(result.get().getInterviewMode()).isEqualTo("IN_PERSON");
//                assertThat(result.get().getLocation()).isEqualTo("123 Main St");
//                verify(interviewDAO, times(1)).findByStudentApplication(application.getId());
//        }
//}
