package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.InternAssessmentDAO;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.ProfessorDAO;
import cal.ose.internose.service.DTOs.InternAssessmentDTO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.exceptions.ForbiddenException;
import cal.ose.internose.utilities.SessionUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProfessorService Tests")
class ProfessorServiceTest {
    @Mock
    private InternshipContractDAO internshipContractDAO;
    @Mock
    private ProfessorDAO professorDAO;
    @Mock
    private InternAssessmentDAO internAssessmentDAO;

    @InjectMocks
    private ProfessorService professorService;

    @Test
    @DisplayName("Test de la methode findInternshipContractsBy() - Execution normale")
    void testFindInternshipContractsBy_ExecutionNormale() throws ForbiddenException {
        // Arrange
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("email");

        SecurityContextHolder.setContext(securityContext);

        Professor professor = Professor.builder()
            .id(1L)
            .credentials(new Credentials("email", "password", UserRole.PROFESSOR))
            .build();

        Student student1 = Student.builder().firstName("John").lastName("Doe").build();
        Student student2 = Student.builder().firstName("Bob").lastName("Doe").build();
        Student student3 = Student.builder().firstName("Alice").lastName("Doe").build();

        InternshipContract internshipContract1 = InternshipContract.builder().student(student1).build();
        InternshipContract internshipContract2 = InternshipContract.builder().student(student2)
            .internshipOffer(InternshipOffer.builder().session("A-2025").build()).build();
        InternshipContract internshipContract3 = InternshipContract.builder().student(student3).build();

        when(professorDAO.findById(any())).thenReturn(Optional.ofNullable(professor));
        when(internshipContractDAO.findAllByProfessorWithOptionalFilters(professor, SessionUtil.getCurrentSession(),
            "%robert%", null, null)).thenReturn(
            List.of(internshipContract1, internshipContract3, internshipContract2)
        );

        // Act
        List<InternshipContractDTO> contractDTOS = professorService.findInternshipContractsBy(1L, "robert", null, null, "student");

        // Assert
        assertEquals("Bob", contractDTOS.get(1).getStudentFirstName());
        assertEquals(3, contractDTOS.size());
        assertEquals("A-2025", contractDTOS.get(1).getInternshipOfferSession());
    }

    @Test
    @DisplayName("Test de la methode findInternshipContractsBy - professeur non trouvee")
    void testFindInternshipContractsBy_professorNotFound() throws ForbiddenException {
        // Arrange
        when(professorDAO.findById(any())).thenReturn(Optional.empty());

        // Act && Assert
        assertThrows(NoSuchElementException.class, () -> professorService.findInternshipContractsBy(1L, null, null, null, null));
    }

    @Test
    @DisplayName("Test de la methode findInternshipContractsBy - professeur n'est pas le bon")
    void testFindInternshipContractsBy_Forbidden() {
        // Arrange
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("emai");

        SecurityContextHolder.setContext(securityContext);

        Professor professor = Professor.builder()
            .id(1L)
            .credentials(new Credentials("email", "password", UserRole.PROFESSOR))
            .build();

        when(professorDAO.findById(any())).thenReturn(Optional.ofNullable(professor));

        // Act
        assertThrows(ForbiddenException.class, () -> professorService.findInternshipContractsBy(1L, null, null, null, null));
    }

    @Test
    @DisplayName("Test de la methode findInternAssessment - Execution normale")
    void testFindInternAssessment_ExecutionNormale() throws ForbiddenException {
        // Arrange
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("email");

        SecurityContextHolder.setContext(securityContext);

        Professor professor = Professor.builder().credentials(new Credentials("email", "password", UserRole.PROFESSOR)).build();
        InternshipContract internshipContract = InternshipContract.builder().build();
        internshipContract.setProfessor(professor);

        InternAssessment internAssessment = InternAssessment.builder().companyName("Hydro").build();

        when(internshipContractDAO.findById(1L)).thenReturn(Optional.of(internshipContract));
        when(internAssessmentDAO.findByInternshipContract(internshipContract)).thenReturn(internAssessment);

        // Act
        InternAssessmentDTO internAssessmentDTO = professorService.findInternAssessment(1L);

        // Assert
        assertEquals("Hydro", internAssessmentDTO.getCompanyName());
    }

    @Test
    @DisplayName("Test de la methode findInternAssessment - NoInternAssessmentFound")
    void testFindInternAssessment_NoInternAssessmentFound() throws ForbiddenException {
        // Arrange
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("email");

        SecurityContextHolder.setContext(securityContext);

        Professor professor = Professor.builder().credentials(new Credentials("email", "password", UserRole.PROFESSOR)).build();
        InternshipContract internshipContract = InternshipContract.builder().build();
        internshipContract.setProfessor(professor);

        when(internshipContractDAO.findById(1L)).thenReturn(Optional.of(internshipContract));
        when(internAssessmentDAO.findByInternshipContract(internshipContract))
            .thenReturn(null);

        // Act && Assert
        assertThrows(NoSuchElementException.class, () -> professorService.findInternAssessment(1L));
    }
}
