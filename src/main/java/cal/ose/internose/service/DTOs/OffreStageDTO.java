package cal.ose.internose.service.DTOs;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Builder
@Getter
public class OffreStageDTO {
    private String titrePoste;
    private String descriptionTaches;
    private String competencesRequises;
    private int duree;
    private LocalDate dateDebut;
    private double remuneration;
    private String adresse;
}
