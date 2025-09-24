package cal.ose.internose.modele;

import cal.ose.internose.service.DTOs.InternshipOfferDTO;
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
public class InternshipOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne
    private Employer employer;
    private String jobTitle;
    private String taskDescription;
    private String qualifications;
    private int duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private double salary;
    private String address;
    @Builder.Default
    private boolean validee = false;

    public static InternshipOffer fromDTO(InternshipOfferDTO internshipOfferDTO) {
        return InternshipOffer.builder()
            .jobTitle(internshipOfferDTO.getJobTitle())
            .taskDescription(internshipOfferDTO.getTaskDescription())
            .qualifications(internshipOfferDTO.getQualifications())
            .duration(internshipOfferDTO.getDuration())
            .startDate(internshipOfferDTO.getStartDate())
            .endDate(
                internshipOfferDTO.getStartDate().plusWeeks(internshipOfferDTO.getDuration())
            )
            .salary(internshipOfferDTO.getSalary())
            .address(internshipOfferDTO.getAddress())
            .build();
    }
}
