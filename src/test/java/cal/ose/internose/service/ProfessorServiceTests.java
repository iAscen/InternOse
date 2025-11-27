package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipContract;
import cal.ose.internose.modele.Professor;
import cal.ose.internose.modele.SiteAssessment;
import cal.ose.internose.modele.User;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.SiteAssessmentDAO;
import cal.ose.internose.persistance.ProfessorDAO;
import cal.ose.internose.persistance.UserDAO;
import cal.ose.internose.service.DTOs.SiteAssessmentDTO;
import cal.ose.internose.service.exceptions.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfessorServiceTests {

    @Mock
    private InternshipContractDAO internshipContractDAO;


    @Mock
    private SiteAssessmentDAO siteAssessmentDAO;

    @Mock
    private ProfessorDAO professorDAO;

    @Mock
    private UserDAO userDAO;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfessorService professorService;

    private Professor professor;
    private InternshipContract internshipContract;
    private SiteAssessmentDTO siteAssessmentDTO;
    private SiteAssessment siteAssessment;

    @BeforeEach
    void setUp() {
        professor = Professor.builder()
            .id(1L)
            .firstName("Thomas")
            .lastName("Dupont")
            .build();

        internshipContract = InternshipContract.builder()
            .id(1L)
            .professor(professor)
            .build();

        siteAssessmentDTO = SiteAssessmentDTO.builder()
            .studentName("Alice A.")
            .companyName("SQL Technologies")
            .supervisorName("Jean Tremblay")
            .internshipPosition("Développeur Kotlin")
            .internshipDuration("8 semaines")
            .siteAssessment(Map.of(
                "welcomeMeasures", SiteAssessment.AssessmentOptions.COMPLETELY_AGREE
            ))
            .siteAssessmentComments(Map.of(
                "welcomeMeasures", "Très bon accueil"
            ))
            .overallSiteAppreciation(SiteAssessment.OverallSiteAppreciation.EXCELLENT)
            .generalComments("Excellent milieu de stage")
            .recommendation(SiteAssessment.Recommendation.STRONGLY_RECOMMEND)
            .professorName("Thomas Dupont")
            .signature("Thomas Dupont")
            .assessmentDate("2024-11-23")
            .build();

        siteAssessment = SiteAssessment.fromDTO(siteAssessmentDTO);
        siteAssessment.setId(1L);
        siteAssessment.setInternshipContract(internshipContract);
    }

    @Test
    void testSaveSiteAssessment_Success() throws ForbiddenException {
        // Arrange
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        User user = mock(User.class);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
        SecurityContextHolder.setContext(securityContext);

        when(internshipContractDAO.findById(1L)).thenReturn(Optional.of(internshipContract));
        when(siteAssessmentDAO.findByInternshipContract(internshipContract)).thenReturn(null);
        when(userDAO.findByCredentials_Email("test@example.com")).thenReturn(Optional.of(user));
        when(user.getPassword()).thenReturn("encodedPassword");
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(siteAssessmentDAO.save(any(SiteAssessment.class))).thenReturn(siteAssessment);

        // Act
        SiteAssessmentDTO result = professorService.saveSiteAssessment(1L, 1L, siteAssessmentDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getStudentName()).isEqualTo("Alice A.");
        assertThat(result.getCompanyName()).isEqualTo("SQL Technologies");
        assertThat(result.getOverallSiteAppreciation()).isEqualTo(SiteAssessment.OverallSiteAppreciation.EXCELLENT);

        verify(internshipContractDAO, times(1)).findById(1L);
        verify(siteAssessmentDAO, times(1)).findByInternshipContract(internshipContract);
        verify(siteAssessmentDAO, times(1)).save(any(SiteAssessment.class));
    }

    @Test
    void testSaveSiteAssessment_ContractNotFound() {
        // Arrange
        when(internshipContractDAO.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        NoSuchElementException exception = assertThrows(
            NoSuchElementException.class,
            () -> professorService.saveSiteAssessment(1L, 999L, siteAssessmentDTO)
        );

        assertThat(exception.getMessage()).isEqualTo("Contrat non trouvé");
        verify(internshipContractDAO, times(1)).findById(999L);
        verify(siteAssessmentDAO, never()).save(any());
    }

    @Test
    void testSaveSiteAssessment_WrongProfessor() {
        // Arrange
        Professor differentProfessor = Professor.builder().id(2L).build();
        internshipContract.setProfessor(differentProfessor);

        when(internshipContractDAO.findById(1L)).thenReturn(Optional.of(internshipContract));

        // Act & Assert
        ForbiddenException exception = assertThrows(
            ForbiddenException.class,
            () -> professorService.saveSiteAssessment(1L, 1L, siteAssessmentDTO)
        );

        assertThat(exception.getMessage()).isEqualTo("Vous n'êtes pas le professeur responsable de ce contrat de stage!");
        verify(internshipContractDAO, times(1)).findById(1L);
        verify(siteAssessmentDAO, never()).save(any());
    }

    @Test
    void testSaveSiteAssessment_AssessmentAlreadyExists() {
        // Arrange
        SiteAssessment existingAssessment = SiteAssessment.builder()
            .id(1L)
            .internshipContract(internshipContract)
            .build();

        when(internshipContractDAO.findById(1L)).thenReturn(Optional.of(internshipContract));
        when(siteAssessmentDAO.findByInternshipContract(internshipContract)).thenReturn(existingAssessment);

        // Act & Assert
        ForbiddenException exception = assertThrows(
            ForbiddenException.class,
            () -> professorService.saveSiteAssessment(1L, 1L, siteAssessmentDTO)
        );

        assertThat(exception.getMessage()).isEqualTo("Vous ne pouvez pas modifier une évaluation du milieu de stage");
        verify(internshipContractDAO, times(1)).findById(1L);
        verify(siteAssessmentDAO, times(1)).findByInternshipContract(internshipContract);
        verify(siteAssessmentDAO, never()).save(any());
    }

    @Test
    void testFindSiteAssessment_Success_WhenAssessmentExists() throws ForbiddenException {
        // Arrange
        when(internshipContractDAO.findById(1L)).thenReturn(Optional.of(internshipContract));
        when(professorDAO.findById(1L)).thenReturn(Optional.of(professor));
        when(siteAssessmentDAO.findByInternshipContract(internshipContract)).thenReturn(siteAssessment);

        // Act
        SiteAssessmentDTO result = professorService.findSiteAssessment(1L, 1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getStudentName()).isEqualTo(siteAssessmentDTO.getStudentName());
        assertThat(result.getCompanyName()).isEqualTo(siteAssessmentDTO.getCompanyName());

        verify(internshipContractDAO, times(1)).findById(1L);
        verify(professorDAO, times(1)).findById(1L);
        verify(siteAssessmentDAO, times(1)).findByInternshipContract(internshipContract);
    }

    @Test
    void testFindSiteAssessment_ReturnsNull_WhenNoAssessment() throws ForbiddenException {
        // Arrange
        when(internshipContractDAO.findById(1L)).thenReturn(Optional.of(internshipContract));
        when(professorDAO.findById(1L)).thenReturn(Optional.of(professor));
        when(siteAssessmentDAO.findByInternshipContract(internshipContract)).thenReturn(null);

        // Act
        SiteAssessmentDTO result = professorService.findSiteAssessment(1L, 1L);

        // Assert - null indicates frontend should show empty form
        assertThat(result).isNull();

        verify(internshipContractDAO, times(1)).findById(1L);
        verify(professorDAO, times(1)).findById(1L);
        verify(siteAssessmentDAO, times(1)).findByInternshipContract(internshipContract);
    }

    @Test
    void testFindSiteAssessment_ContractNotFound() {
        // Arrange
        when(internshipContractDAO.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        NoSuchElementException exception = assertThrows(
            NoSuchElementException.class,
            () -> professorService.findSiteAssessment(1L, 999L)
        );

        assertThat(exception.getMessage()).isEqualTo("Contrat non trouvé");
        verify(internshipContractDAO, times(1)).findById(999L);
        verify(siteAssessmentDAO, never()).findByInternshipContract(any());
    }

    @Test
    void testFindSiteAssessment_Forbidden_WhenProfessorNotAssigned() {
        // Arrange
        Professor other = Professor.builder().id(2L).build();
        when(internshipContractDAO.findById(1L)).thenReturn(Optional.of(internshipContract));
        when(professorDAO.findById(1L)).thenReturn(Optional.of(other));

        // Act & Assert
        ForbiddenException exception = assertThrows(
            ForbiddenException.class,
            () -> professorService.findSiteAssessment(1L, 1L)
        );

        assertThat(exception.getMessage()).isEqualTo("Vous n'êtes pas le professeur responsable de ce contrat de stage!");
        verify(internshipContractDAO, times(1)).findById(1L);
        verify(professorDAO, times(1)).findById(1L);
        verify(siteAssessmentDAO, never()).findByInternshipContract(any());
    }
}
