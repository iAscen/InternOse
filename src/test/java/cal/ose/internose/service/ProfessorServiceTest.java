package cal.ose.internose.service;

import cal.ose.internose.modele.Credentials;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipContract;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Professor;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.UserRole;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.ProfessorDAO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.utilities.SessionUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProfessorService Tests")
class ProfessorServiceTest {
    @Mock
    private InternshipContractDAO internshipContractDAO;

    @Mock
    private ProfessorDAO professorDAO;

    @InjectMocks
    private ProfessorService professorService;

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Exécution normale")
    void testFindInternshipContracts_NormalExecution() {
        // Arrange
        Long professorId = 1L;
        Professor professor = Professor.builder()
            .id(professorId)
            .credentials(new Credentials("professor@example.com", "password", UserRole.PROFESSOR))
            .build();

        Student student = Student.builder()
            .id(1L)
            .firstName("John")
            .lastName("Doe")
            .program("420.B0")
            .credentials(new Credentials("john.doe@example.com", "password", UserRole.STUDENT))
            .build();

        Employer employer = Employer.builder()
            .id(1L)
            .company("TechCorp")
            .credentials(new Credentials("employer@techcorp.com", "password", UserRole.EMPLOYER))
            .build();

        InternshipOffer internshipOffer = InternshipOffer.builder()
            .id(1L)
            .title("Développeur Full Stack")
            .address("123 Main St, Montreal, QC")
            .session(SessionUtil.getCurrentSession())
            .build();

        InternshipContract contract = InternshipContract.builder()
            .id(1L)
            .student(student)
            .employer(employer)
            .internshipOffer(internshipOffer)
            .professor(professor)
            .startDate(LocalDate.of(2024, 6, 1))
            .endDate(LocalDate.of(2024, 8, 31))
            .supervisorName("Jane Smith")
            .supervisorEmail("jane.smith@techcorp.com")
            .supervisorPhone("514-123-4567")
            .isSignedStudent(true)
            .isSignedEmployer(false)
            .isSignedInternshipManager(false)
            .build();

        when(professorDAO.findById(professorId)).thenReturn(Optional.of(professor));
        when(internshipContractDAO.findByProfessorAndSession(professor, SessionUtil.getCurrentSession()))
            .thenReturn(List.of(contract));

        // Act
        List<InternshipContractDTO> result = professorService.findInternshipContracts(professorId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(1);
        InternshipContractDTO dto = result.get(0);
        assertThat(dto.getStudentFirstName()).isEqualTo("John");
        assertThat(dto.getStudentLastName()).isEqualTo("Doe");
        assertThat(dto.getStudentEmail()).isEqualTo("john.doe@example.com");
        assertThat(dto.getStudentProgram()).isEqualTo("420.B0");
        assertThat(dto.getEmployerCompany()).isEqualTo("TechCorp");
        assertThat(dto.getInternshipOfferAddress()).isEqualTo("123 Main St, Montreal, QC");
        assertThat(dto.getInternshipOfferSession()).isEqualTo(SessionUtil.getCurrentSession());
        assertThat(dto.getSupervisorName()).isEqualTo("Jane Smith");
        assertThat(dto.getSupervisorEmail()).isEqualTo("jane.smith@techcorp.com");
        assertThat(dto.getSupervisorPhone()).isEqualTo("514-123-4567");
        assertThat(dto.getIsSignedStudent()).isTrue();
        assertThat(dto.getIsSignedEmployer()).isFalse();
        assertThat(dto.getIsSignedInternshipManager()).isFalse();

        verify(professorDAO, times(1)).findById(professorId);
        verify(internshipContractDAO, times(1))
            .findByProfessorAndSession(professor, SessionUtil.getCurrentSession());
    }

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Professeur non trouvé")
    void testFindInternshipContracts_ProfessorNotFound() {
        // Arrange
        Long professorId = 999L;
        when(professorDAO.findById(professorId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NoSuchElementException.class, () -> {
            professorService.findInternshipContracts(professorId);
        });

        verify(professorDAO, times(1)).findById(professorId);
        verify(internshipContractDAO, never()).findByProfessorAndSession(any(), anyString());
    }

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Liste vide")
    void testFindInternshipContracts_EmptyList() {
        // Arrange
        Long professorId = 1L;
        Professor professor = Professor.builder()
            .id(professorId)
            .credentials(new Credentials("professor@example.com", "password", UserRole.PROFESSOR))
            .build();

        when(professorDAO.findById(professorId)).thenReturn(Optional.of(professor));
        when(internshipContractDAO.findByProfessorAndSession(professor, SessionUtil.getCurrentSession()))
            .thenReturn(List.of());

        // Act
        List<InternshipContractDTO> result = professorService.findInternshipContracts(professorId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(0);

        verify(professorDAO, times(1)).findById(professorId);
        verify(internshipContractDAO, times(1))
            .findByProfessorAndSession(professor, SessionUtil.getCurrentSession());
    }

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Plusieurs contrats")
    void testFindInternshipContracts_MultipleContracts() {
        // Arrange
        Long professorId = 1L;
        Professor professor = Professor.builder()
            .id(professorId)
            .credentials(new Credentials("professor@example.com", "password", UserRole.PROFESSOR))
            .build();

        Student student1 = Student.builder()
            .id(1L)
            .firstName("John")
            .lastName("Doe")
            .program("420.B0")
            .credentials(new Credentials("john.doe@example.com", "password", UserRole.STUDENT))
            .build();

        Student student2 = Student.builder()
            .id(2L)
            .firstName("Alice")
            .lastName("Johnson")
            .program("410.A1")
            .credentials(new Credentials("alice.johnson@example.com", "password", UserRole.STUDENT))
            .build();

        Employer employer1 = Employer.builder()
            .id(1L)
            .company("TechCorp")
            .credentials(new Credentials("employer1@techcorp.com", "password", UserRole.EMPLOYER))
            .build();

        Employer employer2 = Employer.builder()
            .id(2L)
            .company("DataSys")
            .credentials(new Credentials("employer2@datasys.com", "password", UserRole.EMPLOYER))
            .build();

        InternshipOffer offer1 = InternshipOffer.builder()
            .id(1L)
            .title("Développeur Full Stack")
            .address("123 Main St, Montreal, QC")
            .session(SessionUtil.getCurrentSession())
            .build();

        InternshipOffer offer2 = InternshipOffer.builder()
            .id(2L)
            .title("Analyste de données")
            .address("456 Tech Ave, Montreal, QC")
            .session(SessionUtil.getCurrentSession())
            .build();

        InternshipContract contract1 = InternshipContract.builder()
            .id(1L)
            .student(student1)
            .employer(employer1)
            .internshipOffer(offer1)
            .professor(professor)
            .startDate(LocalDate.of(2024, 6, 1))
            .endDate(LocalDate.of(2024, 8, 31))
            .build();

        InternshipContract contract2 = InternshipContract.builder()
            .id(2L)
            .student(student2)
            .employer(employer2)
            .internshipOffer(offer2)
            .professor(professor)
            .startDate(LocalDate.of(2024, 6, 15))
            .endDate(LocalDate.of(2024, 9, 15))
            .build();

        when(professorDAO.findById(professorId)).thenReturn(Optional.of(professor));
        when(internshipContractDAO.findByProfessorAndSession(professor, SessionUtil.getCurrentSession()))
            .thenReturn(List.of(contract1, contract2));

        // Act
        List<InternshipContractDTO> result = professorService.findInternshipContracts(professorId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getStudentFirstName()).isEqualTo("John");
        assertThat(result.get(1).getStudentFirstName()).isEqualTo("Alice");

        verify(professorDAO, times(1)).findById(professorId);
        verify(internshipContractDAO, times(1))
            .findByProfessorAndSession(professor, SessionUtil.getCurrentSession());
    }

    @Test
    @DisplayName("Test de la méthode findInternshipContracts() - Filtrage par session")
    void testFindInternshipContracts_SessionFiltering() {
        // Arrange
        Long professorId = 1L;
        Professor professor = Professor.builder()
            .id(professorId)
            .credentials(new Credentials("professor@example.com", "password", UserRole.PROFESSOR))
            .build();

        String currentSession = SessionUtil.getCurrentSession();

        when(professorDAO.findById(professorId)).thenReturn(Optional.of(professor));
        when(internshipContractDAO.findByProfessorAndSession(professor, currentSession))
            .thenReturn(List.of());

        // Act
        List<InternshipContractDTO> result = professorService.findInternshipContracts(professorId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(0);

        // Vérifier que la méthode a été appelée avec la bonne session
        verify(internshipContractDAO, times(1))
            .findByProfessorAndSession(professor, currentSession);
    }
}

