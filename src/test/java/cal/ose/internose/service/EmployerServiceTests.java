package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployerService Tests")
public class EmployerServiceTests {
    @Mock
    private InternshipOfferDAO internshipOfferDAO;

    @InjectMocks
    private EmployerService employerService;

    @Test
    @DisplayName("Test de la méthode listInternshipOffers()")
    public void testListInternshipOffers() {
        // Arrange
        when(internshipOfferDAO.findAll()).thenReturn(listInternshipOffers());
        // Act
        List<InternshipOfferDTO> internshipOfferDTOs = employerService.listInternshipOffers();
        // Assert
        assertThat(internshipOfferDTOs.size()).isEqualTo(1);
        verify(internshipOfferDAO, times(1)).findAll();
    }

    @Test
    @DisplayName("Test de la méthode createInternshipOffer()")
    public void testCreateInternshipOffer() {
        // Arrange
        InternshipOffer internshipOffer = listInternshipOffers().getFirst();
        InternshipOfferDTO internshipOfferDTO = InternshipOfferDTO.fromEntity(internshipOffer);
        when(internshipOfferDAO.save(any(InternshipOffer.class))).thenReturn(internshipOffer);
        // Act
        Optional<InternshipOffer> newInternshipOffer = employerService.createInternshipOffer(internshipOfferDTO);
        // Assert
        assertThat(newInternshipOffer).isPresent();
        verify(internshipOfferDAO, times(1)).save(any(InternshipOffer.class));
    }

    private List<InternshipOffer> listInternshipOffers() {
        List<InternshipOffer> internshipOffers = new ArrayList<>();
        internshipOffers.add(
            InternshipOffer.builder()
                .jobTitle("Ingénieur logiciel junior chez Hydro-Québec")
                .taskDescription("*description ici*")
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
