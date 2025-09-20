package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.OffreStage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
public class OffreStageDTO {
    private String titrePoste;
    private String descriptionTaches;
    private String competencesRequises;
    private int duree;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private double remuneration;
    private String adresse;

    public static OffreStageDTO fromEntity(OffreStage offreStage) {
        return OffreStageDTO.builder()
            .titrePoste(offreStage.getTitrePoste())
            .descriptionTaches(offreStage.getDescriptionTaches())
            .competencesRequises(offreStage.getCompetencesRequises())
            .duree(offreStage.getDuree())
            .dateDebut(offreStage.getDateDebut())
            .dateFin(offreStage.getDateFin())
            .remuneration(offreStage.getRemuneration())
            .adresse(offreStage.getAdresse())
            .build();
    }

    public static List<OffreStageDTO> fromEntityList(List<OffreStage> offreStages) {
        return offreStages.stream().map(OffreStageDTO::fromEntity).toList();
    }
}
