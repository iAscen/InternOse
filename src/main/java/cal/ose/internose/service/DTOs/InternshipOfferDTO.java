package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.modele.InternshipOffer;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class InternshipOfferDTO {
    private Long id;
    private String title;
    private String description;
    private String program;
    private String requiredSkills;
    private int duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private double salary;
    private String address;
    private VerificationStatus verificationStatus;
    private String rejectionReason;

    public boolean isVerified() {
        return verificationStatus != VerificationStatus.PENDING;
    }

    public static InternshipOfferDTO fromEntity(InternshipOffer internshipOffer) {
        return InternshipOfferDTO.builder()
            .id(internshipOffer.getId())
            .title(internshipOffer.getTitle())
            .description(internshipOffer.getDescription())
            .program(internshipOffer.getProgram())
            .requiredSkills(internshipOffer.getRequiredSkills())
            .duration(internshipOffer.getDuration())
            .startDate(internshipOffer.getStartDate())
            .endDate(internshipOffer.getEndDate())
            .salary(internshipOffer.getSalary())
            .address(internshipOffer.getAddress())
            .verificationStatus(internshipOffer.getVerificationStatus())
            .rejectionReason(internshipOffer.getRejectionReason())
            .build();
    }

    public static List<InternshipOfferDTO> fromEntityList(List<InternshipOffer> internshipOffers) {
        return internshipOffers.stream().map(InternshipOfferDTO::fromEntity).toList();
    }
}
