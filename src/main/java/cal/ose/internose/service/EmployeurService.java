package cal.ose.internose.service;

import cal.ose.internose.modele.OffreStage;
import cal.ose.internose.persistance.OffreStageDAO;
import cal.ose.internose.service.DTOs.OffreStageDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public void creerOffreStage(OffreStageDTO offreStageDTO) {
        offreStageDAO.save(
            OffreStage.builder()
                .titrePoste(offreStageDTO.getTitrePoste())
                .descriptionTaches(offreStageDTO.getDescriptionTaches())
                .competencesRequises(offreStageDTO.getCompetencesRequises())
                .adresse(offreStageDTO.getAdresse())
                .duree(offreStageDTO.getDuree())
                .dateDebut(offreStageDTO.getDateDebut())
                .dateFin(
                    offreStageDTO.getDateDebut().plusWeeks(offreStageDTO.getDuree())
                )
                .remuneration(offreStageDTO.getRemuneration())
                .build()
        );
    }
}
