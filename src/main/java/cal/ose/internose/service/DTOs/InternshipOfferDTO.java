package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.InternshipOffer;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class InternshipOfferDTO {
    private Long id;
    private String jobTitle;
    private String taskDescription;
    private String program;
    private String qualifications;
    private int duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private double salary;
    private String address;
    private DocumentStatus validationStatus;
    private String rejectionReason;

    public boolean isValidee() {
        return validationStatus != DocumentStatus.PENDING;
    }

    public static InternshipOfferDTO fromEntity(InternshipOffer internshipOffer) {
        return InternshipOfferDTO.builder()
            .id(internshipOffer.getId())
            .jobTitle(internshipOffer.getJobTitle())
            .taskDescription(internshipOffer.getTaskDescription())
            .program(internshipOffer.getProgram())
            .qualifications(internshipOffer.getQualifications())
            .duration(internshipOffer.getDuration())
            .startDate(internshipOffer.getStartDate())
            .endDate(internshipOffer.getEndDate())
            .salary(internshipOffer.getSalary())
            .address(internshipOffer.getAddress())

            .validationStatus(internshipOffer.getValidationStatus())
            .rejectionReason(internshipOffer.getRejectionReason())
            .build();
    }

    public static List<InternshipOfferDTO> fromEntityList(List<InternshipOffer> internshipOffers) {
        return internshipOffers.stream().map(InternshipOfferDTO::fromEntity).toList();
    }
}
