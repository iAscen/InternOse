package cal.ose.internose.modele;

import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class InternshipOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne
    private Employer employer;
    private String title;
    private String description;
    private String program;
    private String requiredSkills;
    private int duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private double salary;
    private String address;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.NONE;
    private String rejectionReason;

    public boolean isVerified() {
        return verificationStatus != VerificationStatus.PENDING;
    }

    public static InternshipOffer fromDTO(InternshipOfferDTO internshipOfferDTO) {
        return InternshipOffer.builder()
            .title(internshipOfferDTO.getTitle())
            .description(internshipOfferDTO.getDescription())
            .program(internshipOfferDTO.getProgram())
            .requiredSkills(internshipOfferDTO.getRequiredSkills())
            .duration(internshipOfferDTO.getDuration())
            .startDate(internshipOfferDTO.getStartDate())
            .endDate(internshipOfferDTO.getStartDate().plusWeeks(internshipOfferDTO.getDuration()))
            .salary(internshipOfferDTO.getSalary())
            .address(internshipOfferDTO.getAddress())
            .verificationStatus(internshipOfferDTO.getVerificationStatus())
            .rejectionReason(internshipOfferDTO.getRejectionReason())
            .build();
    }
}
