package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.security.exception.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class InternshipManagerService {
    private InternshipOfferDAO internshipOfferDAO;

    public List<InternshipOfferDTO> findInternshipsBy(String domain, Boolean valid, String enterprise, String filter) {
        List<InternshipOffer> internshipOffers = internshipOfferDAO.findInternshipsBy(domain, valid, enterprise);

        if (domain != null) {
            internshipOffers = internshipOffers.stream()
                    .filter(io -> Objects.equals(io.getDomain(), domain))
                    .collect(Collectors.toList());
        }
        if (valid != null) {
            internshipOffers = internshipOffers.stream()
                    .filter(io -> Objects.equals(io.isValidee(), valid))
                    .collect(Collectors.toList());
        }
        if (enterprise != null) {
            internshipOffers = internshipOffers.stream()
                    .filter(io -> io.getEmployer() != null && Objects.equals(io.getEmployer().getEnterprise(), enterprise))
                    .collect(Collectors.toList());
        }

        if (!internshipOffers.isEmpty()) {
            if (filter != null && filter.equals("enterprise")) {
                internshipOffers = internshipOffers.stream()
                        .sorted(Comparator.comparing(io -> io.getEmployer().getEnterprise()))
                        .toList();
            } else if (filter != null && filter.equals("status")) {
                internshipOffers = internshipOffers.stream()
                        .sorted(Comparator.comparing(InternshipOffer::isValidee))
                        .toList();
            } else {
                internshipOffers = internshipOffers.stream()
                        .sorted(Comparator.comparing(InternshipOffer::getDomain))
                        .toList();
            }
        }

        return InternshipOfferDTO.fromEntityList(internshipOffers);
    }

    public InternshipOffer getInternshipOfferById(Long id) {
        InternshipOffer offer = internshipOfferDAO.findInternshipOfferById(id);
        if (offer == null) {
            throw new ResourceNotFoundException("Internship Offer not found");
        }
        return offer;
    }

    // approuve: true = approuvé, false = rejeté
    public void validateInternshipOffer(Long id, boolean approuve, String commentaire) {

        InternshipOffer offer = getInternshipOfferById(id);

        offer.setValidee(true);
        if (!approuve) {
            offer.setRejectionReason(commentaire);
            offer.setValidationStatus("rejeté");
        }
        else {
            offer.setValidationStatus("approuvé");
            offer.setRejectionReason(null);
        }

        internshipOfferDAO.save(offer);
    }
}
