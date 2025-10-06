package cal.ose.internose.modele;

import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private String jobTitle;
    private String taskDescription;
    private String domain;
    private String qualifications;
    private int duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private double salary;
    private String address;
    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status")
    @Builder.Default
    private DocumentStatus validationStatus = DocumentStatus.NONE;

    @Column(name = "offer_rejection_reason", length = 2000)
    private String rejectionReason;

    // Backward compatibility method
    public boolean isValidee() {
        return validationStatus != DocumentStatus.PENDING;
    }

    public static InternshipOffer fromDTO(InternshipOfferDTO internshipOfferDTO) {
        return InternshipOffer.builder()
                .jobTitle(internshipOfferDTO.getJobTitle())
                .taskDescription(internshipOfferDTO.getTaskDescription())
                .domain(internshipOfferDTO.getDomain())
                .qualifications(internshipOfferDTO.getQualifications())
                .duration(internshipOfferDTO.getDuration())
                .startDate(internshipOfferDTO.getStartDate())
                .endDate(
                        internshipOfferDTO.getStartDate().plusWeeks(internshipOfferDTO.getDuration()))
                .salary(internshipOfferDTO.getSalary())
                .address(internshipOfferDTO.getAddress())
                .validationStatus(internshipOfferDTO.getValidationStatus())
                .rejectionReason(internshipOfferDTO.getRejectionReason())
                .build();
    }
}
