package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.security.exception.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InternshipManagerServiceTest {
    @Mock
    private InternshipOfferDAO internshipOfferDAO;

    @InjectMocks
    private InternshipManagerService internshipManagerService;

    @Test
    void findInternshipsBy() {
        when(internshipOfferDAO.findInternshipsBy("%Informatique%", null, null))
                .thenReturn(getInformatiqueInternships());

        List<InternshipOfferDTO> internshipOfferDTOS = internshipManagerService
                .findInternshipsBy("Informatique", null, null, "status");

        assertEquals(3, internshipOfferDTOS.size());
        assertEquals("Informatique", internshipOfferDTOS.getFirst().getDomain());
        assertFalse(internshipOfferDTOS.getFirst().isValidee());
    }



    @Test
    void sortByDomain() {
        when(internshipOfferDAO.findInternshipsBy(null, null, null))
                .thenReturn(List.of(
                        InternshipOffer.builder().domain("Informatique").validee(true).build(),
                        InternshipOffer.builder().domain("Biologie").validee(true).build(),
                        InternshipOffer.builder().domain("Architecture").validee(false).build()
                ));

        List<InternshipOfferDTO> result = internshipManagerService
                .findInternshipsBy(null, null, null, null);

        assertEquals(3, result.size());
        assertEquals("Architecture", result.get(0).getDomain());
        assertEquals("Biologie", result.get(1).getDomain());
        assertEquals("Informatique", result.get(2).getDomain());
    }

    @Test
    void findInternshipsByNothingFound() {
        when(internshipOfferDAO.findInternshipsBy("%non%", null, null))
                .thenReturn(List.of());

        List<InternshipOfferDTO> internshipOfferDTOS = internshipManagerService
                .findInternshipsBy("non", null, null, null);

        assertEquals(0, internshipOfferDTOS.size());
    }

    @Test
    void approveInternshipOffer() {
        Long offerId = 1L;
        InternshipOffer existing = InternshipOffer.builder()
                .id(offerId)
                .validee(false)
                .validationStatus(null)
                .rejectionReason("Old reason that should be cleared")
                .build();
        when(internshipOfferDAO.findInternshipOfferById(offerId)).thenReturn(existing);


        internshipManagerService.validateInternshipOffer(offerId, true, "any comment should be ignored on approve");


        ArgumentCaptor<InternshipOffer> captor = ArgumentCaptor.forClass(InternshipOffer.class);
        verify(internshipOfferDAO, times(1)).save(captor.capture());
        InternshipOffer saved = captor.getValue();

        assertTrue(saved.isValidee(), "Offer must be marked as validated");
        assertEquals("approuvé", saved.getValidationStatus(), "Status must be 'approuvé' on approval");
        assertNull(saved.getRejectionReason(), "Rejection reason must be cleared on approval");
    }


    @Test
    void rejectInternshipOffer() {
        Long offerId = 2L;
        String rejectionComment = "Détails insufficient dans la description";
        InternshipOffer existing = InternshipOffer.builder()
                .id(offerId)
                .validee(false)
                .validationStatus(null)
                .rejectionReason(null)
                .build();
        when(internshipOfferDAO.findInternshipOfferById(offerId)).thenReturn(existing);


        internshipManagerService.validateInternshipOffer(offerId, false, rejectionComment);


        ArgumentCaptor<InternshipOffer> captor = ArgumentCaptor.forClass(InternshipOffer.class);
        verify(internshipOfferDAO, times(1)).save(captor.capture());
        InternshipOffer saved = captor.getValue();

        assertTrue(saved.isValidee());
        assertEquals("rejeté", saved.getValidationStatus());
        assertEquals(rejectionComment, saved.getRejectionReason());
    }

    @Test
    void validationInternshipOfferNotFound() {
        Long missingId = 999L;
        when(internshipOfferDAO.findInternshipOfferById(missingId)).thenReturn(null);

        assertThrows(ResourceNotFoundException.class, () ->
                internshipManagerService.validateInternshipOffer(missingId, true, null)
        );

        verify(internshipOfferDAO, never()).save(any());
    }

    private List<InternshipOffer> getInformatiqueInternships() {
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
                        .build()
        );
    }
}