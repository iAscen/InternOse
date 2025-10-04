package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.security.exception.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;


@Service
@AllArgsConstructor
public class InternshipManagerService {
    private InternshipOfferDAO internshipOfferDAO;

    public List<InternshipOfferDTO> findInternshipsBy(String domain, Boolean valid, String title, String sortBy) {
        // Ajouter les wildcards pour la recherche LIKE
        String domainPattern = domain != null ? "%" + domain + "%" : null;
        String titlePattern = title != null ? "%" + title + "%" : null;
        
        List<InternshipOffer> internshipOffers = internshipOfferDAO.findInternshipsBy(domainPattern, valid, titlePattern);

        if (!internshipOffers.isEmpty()) {
            if (sortBy != null && sortBy.equals("title")) {
                internshipOffers = internshipOffers.stream()
                        .sorted(Comparator.comparing(InternshipOffer::getJobTitle))
                        .toList();
            } else if (sortBy != null && sortBy.equals("status")) {
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
