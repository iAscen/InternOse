package cal.ose.internose.service.dto;

import cal.ose.internose.modele.Employeur;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
@Builder
public class EmployeurDTO {
    private String nom;
    private String prenom;
    private String email;
    private String entreprise;

    public static EmployeurDTO toDTO(Employeur employeur) {
        return EmployeurDTO.builder()
                .nom(employeur.getNom())
                .prenom(employeur.getPrenom())
                .email(employeur.getEmail())
                .entreprise(employeur.getEntreprise())
                .build();
    }
}
