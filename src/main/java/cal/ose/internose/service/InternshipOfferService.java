package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InternshipOfferSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InternshipOfferService {
    private final InternshipOfferDAO internshipOfferDAO;

    public InternshipOfferService(InternshipOfferDAO internshipOfferDAO) {
        this.internshipOfferDAO = internshipOfferDAO;
    }

    /**
     * Recherche les offres de stage avec filtres et tri
     * @param criteria Critères de recherche et filtrage
     * @return Page d'offres de stage correspondant aux critères
     */
    public Page<InternshipOfferDTO> searchInternshipOffers(InternshipOfferSearchCriteria criteria) {
        // Configuration de la pagination
        int page = criteria.getPage() != null ? criteria.getPage() : 0;
        int size = criteria.getSize() != null ? criteria.getSize() : 10;
        
        // Configuration du tri
        Sort sort = createSort(criteria.getSortBy(), criteria.getSortOrder());
        Pageable pageable = PageRequest.of(page, size, sort);

        // Recherche avec filtres
        Page<InternshipOffer> offers = internshipOfferDAO.findInternshipOffersWithFilters(
                DocumentStatus.APPROVED, // Seules les offres approuvées
                criteria.getProgram(),
                criteria.getLocation(),
                criteria.getJobTitle(),
                criteria.getCompany(),
                criteria.getMinSalary(),
                criteria.getMaxSalary(),
                criteria.getMinDuration(),
                criteria.getMaxDuration(),
                criteria.getStartDateFrom(),
                criteria.getStartDateTo(),
                pageable
        );

        // Conversion en DTOs
        return offers.map(InternshipOfferDTO::fromEntity);
    }

    /**
     * Récupère une offre de stage par son ID
     * @param offerId ID de l'offre
     * @return Offre de stage si trouvée et approuvée
     */
    public Optional<InternshipOfferDTO> getInternshipOfferById(Long offerId) {
        Optional<InternshipOffer> offer = Optional.ofNullable(
                internshipOfferDAO.findByIdAndStatus(offerId, DocumentStatus.APPROVED)
        );
        return offer.map(InternshipOfferDTO::fromEntity);
    }

    /**
     * Récupère toutes les offres de stage approuvées (sans filtres)
     * @return Liste de toutes les offres approuvées
     */
    public List<InternshipOfferDTO> getAllApprovedInternshipOffers() {
        List<InternshipOffer> offers = internshipOfferDAO.findAll().stream()
                .filter(offer -> offer.getValidationStatus() == DocumentStatus.APPROVED)
                .toList();
        return InternshipOfferDTO.fromEntityList(offers);
    }

    /**
     * Compte le nombre d'offres correspondant aux critères
     * @param criteria Critères de recherche
     * @return Nombre d'offres correspondantes
     */
    public long countInternshipOffers(InternshipOfferSearchCriteria criteria) {
        return internshipOfferDAO.countInternshipOffersWithFilters(
                DocumentStatus.APPROVED,
                criteria.getProgram(),
                criteria.getLocation(),
                criteria.getJobTitle(),
                criteria.getCompany(),
                criteria.getMinSalary(),
                criteria.getMaxSalary(),
                criteria.getMinDuration(),
                criteria.getMaxDuration(),
                criteria.getStartDateFrom(),
                criteria.getStartDateTo()
        );
    }

    /**
     * Crée un objet Sort basé sur les critères de tri
     * @param sortBy Critère de tri
     * @param sortOrder Ordre de tri (asc/desc)
     * @return Objet Sort configuré
     */
    private Sort createSort(String sortBy, String sortOrder) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            // Tri par défaut par date de début (plus récent en premier)
            return Sort.by(Sort.Direction.DESC, "startDate");
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? 
                Sort.Direction.DESC : Sort.Direction.ASC;

        return switch (sortBy.toLowerCase()) {
            case "jobtitle", "titre" -> Sort.by(direction, "jobTitle");
            case "company", "entreprise" -> Sort.by(direction, "employer.enterprise");
            case "startdate", "datedebut" -> Sort.by(direction, "startDate");
            case "salary", "salaire" -> Sort.by(direction, "salary");
            case "duration", "duree" -> Sort.by(direction, "duration");
            case "program", "discipline" -> Sort.by(direction, "program");
            case "address", "lieu" -> Sort.by(direction, "address");
            default -> Sort.by(Sort.Direction.DESC, "startDate");
        };
    }
}
