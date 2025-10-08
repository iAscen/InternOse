package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmployerService {
    private final EmployerDAO employerDAO;
    private final InternshipOfferDAO internshipOfferDAO;

    public EmployerService(EmployerDAO employerDAO, InternshipOfferDAO internshipOfferDAO) {
        this.employerDAO = employerDAO;
        this.internshipOfferDAO = internshipOfferDAO;
    }

    public List<InternshipOfferDTO> listInternshipOffers(Long employerID) {
        Employer employer = employerDAO.findById(employerID).orElseThrow();
        return InternshipOfferDTO.fromEntityList(internshipOfferDAO.findAllByEmployer(employer));
    }

    public Optional<InternshipOffer> createInternshipOffer(Long employerID, InternshipOfferDTO internshipOfferDTO) {
        Employer employer = employerDAO.findById(employerID).orElseThrow();
        InternshipOffer internshipOffer = InternshipOffer.fromDTO(internshipOfferDTO);
        internshipOffer.setValidationStatus(DocumentStatus.PENDING);
        internshipOffer.setEmployer(employer); // Définir l'employeur AVANT de sauvegarder
        internshipOffer = internshipOfferDAO.save(internshipOffer);
        return Optional.of(internshipOffer);
    }
}
