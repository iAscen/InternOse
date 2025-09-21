package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmployerService {
    private final InternshipOfferDAO internshipOfferDAO;

    public EmployerService(InternshipOfferDAO internshipOfferDAO) {
        this.internshipOfferDAO = internshipOfferDAO;
    }

    public List<InternshipOfferDTO> listInternshipOffers() {
        return InternshipOfferDTO.fromEntityList(internshipOfferDAO.findAll());
    }

    public Optional<InternshipOffer> createInternshipOffer(InternshipOfferDTO internshipOfferDTO) {
        InternshipOffer internshipOffer = internshipOfferDAO.save(InternshipOffer.fromDTO(internshipOfferDTO));
        return Optional.of(internshipOffer);
    }
}
