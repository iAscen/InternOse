package cal.ose.internose.service;

import cal.ose.internose.modele.OffreStage;
import cal.ose.internose.persistance.OffreStageDAO;
import cal.ose.internose.service.DTOs.OffreStageDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmployeurService {
    private final OffreStageDAO offreStageDAO;

    public EmployeurService(OffreStageDAO offreStageDAO) {
        this.offreStageDAO = offreStageDAO;
    }

    public List<OffreStageDTO> listerOffresStage() {
        return OffreStageDTO.fromEntityList(offreStageDAO.findAll());
    }

    public Optional<OffreStage> creerOffreStage(OffreStageDTO offreStageDTO) {
        OffreStage offreStage = offreStageDAO.save(OffreStage.fromDTO(offreStageDTO));
        return Optional.of(offreStage);
    }
}
