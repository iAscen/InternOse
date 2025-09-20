package cal.ose.internose.modele;

import cal.ose.internose.service.DTOs.OffreStageDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "OFFRES_STAGE")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class OffreStage {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String titrePoste;
    private String descriptionTaches;
    private String competencesRequises;
    private int duree;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private double remuneration;
    private String adresse;
    private boolean validee = false;

    public static OffreStage fromDTO(OffreStageDTO offreStageDTO) {
        return OffreStage.builder()
            .titrePoste(offreStageDTO.getTitrePoste())
            .descriptionTaches(offreStageDTO.getDescriptionTaches())
            .competencesRequises(offreStageDTO.getCompetencesRequises())
            .duree(offreStageDTO.getDuree())
            .dateDebut(offreStageDTO.getDateDebut())
            .dateFin(
                offreStageDTO.getDateDebut().plusWeeks(offreStageDTO.getDuree())
            )
            .remuneration(offreStageDTO.getRemuneration())
            .adresse(offreStageDTO.getAdresse())
            .build();
    }
}
