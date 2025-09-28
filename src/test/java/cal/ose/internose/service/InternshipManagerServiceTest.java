package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InternshipManagerServiceTest {
    @Mock
    private InternshipOfferDAO internshipOfferDAO;

    @InjectMocks
    private InternshipManagerService internshipManagerService;

    @Test
    void findInternshipsBy() {
        when(internshipOfferDAO.findInternshipsBy("Informatique", null, null))
                .thenReturn(getInternships());

        List<InternshipOfferDTO> internshipOfferDTOS = internshipManagerService
                .findInternshipsBy("Informatique", null, null, "status");

        assertEquals(3, internshipOfferDTOS.size());
        assertEquals("Informatique", internshipOfferDTOS.getFirst().getDomain());
        assertFalse(internshipOfferDTOS.getFirst().isValidee());
    }



    @Test
    void findInternshipsByNothingFound() {
        when(internshipOfferDAO.findInternshipsBy("non", null, null))
                .thenReturn(List.of());

        List<InternshipOfferDTO> internshipOfferDTOS = internshipManagerService
                .findInternshipsBy("non", null, null, null);

        assertEquals(0, internshipOfferDTOS.size());
    }

    private List<InternshipOffer> getInternships() {
        return List.of(
                InternshipOffer.builder()
                        .validee(true)
                        .jobTitle("Software Intern")
                        .domain("Informatique")
                        .build(),
                InternshipOffer.builder()
                        .validee(false)
                        .jobTitle("Software Senior")
                        .domain("Informatique")
                        .build(),
                InternshipOffer.builder()
                        .validee(true)
                        .jobTitle("Software Senior")
                        .domain("Informatique")
                        .build(),
                InternshipOffer.builder()
                        .validee(true)
                        .jobTitle("Junior Designer")
                        .domain("Architecture")
                        .build()
        );
    }


}