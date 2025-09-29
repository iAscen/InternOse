package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.InternshipOffer;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
@ToString
public class InternshipOfferDTO {
    private String domain;
    private String jobTitle;
    private String taskDescription;
    private String qualifications;
    private int duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private double salary;
    private String address;
    private boolean validee;

    public static InternshipOfferDTO fromEntity(InternshipOffer internshipOffer) {
        return InternshipOfferDTO.builder()
            .jobTitle(internshipOffer.getJobTitle())
            .taskDescription(internshipOffer.getTaskDescription())
            .qualifications(internshipOffer.getQualifications())
            .duration(internshipOffer.getDuration())
            .startDate(internshipOffer.getStartDate())
            .endDate(internshipOffer.getEndDate())
            .salary(internshipOffer.getSalary())
            .address(internshipOffer.getAddress())
            .domain(internshipOffer.getDomain())
            .validee(internshipOffer.isValidee())
            .build();
    }

    public static List<InternshipOfferDTO> fromEntityList(List<InternshipOffer> internshipOffers) {
        return internshipOffers.stream().map(InternshipOfferDTO::fromEntity).toList();
    }
}
