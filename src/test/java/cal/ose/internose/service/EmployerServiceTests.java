package cal.ose.internose.service;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.security.exception.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployerService Tests")
public class EmployerServiceTests {
    @Mock
    private EmployerDAO employerDAO;

    @Mock
    private InternshipOfferDAO internshipOfferDAO;

    @Mock
    private StudentDAO studentDAO;

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
        Optional<InternshipOffer> newInternshipOffer = employerService.createInternshipOffer(employerID, internshipOfferDTO);
        // Assert
        assertThat(newInternshipOffer).isPresent();
        verify(internshipOfferDAO, times(1)).save(any(InternshipOffer.class));
    }

    @Test
    public void testFindStudentsBy() {
        List<Student> students = List.of(
                Student.builder()
                        .program("Z")
                        .build(),
                Student.builder()
                        .program("A")
                        .build()
        );

        when(internshipOfferDAO.existsById(1L))
                .thenReturn(true);

        when(studentDAO.findStudentsBy(1L, null, null, null))
                .thenReturn(students);

        List<StudentDTO> studentDTOs = employerService.findStudentsBy(1L, null, null, null, "program");

        assertThat(studentDTOs.size()).isEqualTo(2);
        assertThat(studentDTOs.get(0).getProgram()).isEqualTo("A");
        assertThat(studentDTOs.get(1).getProgram()).isEqualTo("Z");
    }

    @Test
    public void testFindStudentsBy_EmptyList() {
        when(internshipOfferDAO.existsById(1L))
                .thenReturn(true);

        when(studentDAO.findStudentsBy(1L, null, null, null))
                .thenReturn(new ArrayList<>());

        List<StudentDTO> studentDTOs = employerService.findStudentsBy(1L, null, null, null, "program");

        assertThat(studentDTOs.size()).isEqualTo(0);
    }

    @Test
    public void testFindStudentsBy_ThrowsResourceNotFoundException() {
        when(internshipOfferDAO.existsById(1L))
                .thenReturn(false);

        assertThrows(
                ResourceNotFoundException.class,
                () -> employerService.findStudentsBy(1L, null, null, null, null)
        );

    }

    private Employer exampleEmployer() {
        return Employer.builder()
            .firstName("Artyom")
            .lastName("M.")
            .enterprise("Artyom Tech Inc.")
            .build();
    }

    private List<InternshipOffer> exampleInternshipOffers() {
        List<InternshipOffer> internshipOffers = new ArrayList<>();
        internshipOffers.add(
            InternshipOffer.builder()
                .jobTitle("Ingénieur logiciel junior chez Artyom Tech Inc.")
                .taskDescription("*description ici*")
                .domain("Technique de l'informatique")
                .qualifications("*compétences requises ici*")
                .duration(6)
                .startDate(LocalDate.of(2026, 1, 23))
                .salary(25.0)
                .address("*adresse du stage ici*")
                .build()
        );
        return internshipOffers;
    }
}
