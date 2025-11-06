package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.InternshipContract;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipContractDTO {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private int weeklyHours;
    private String tasks;
    private String educationalObjectives;
    private String supervisorName;
    private String supervisorTitle;
    private String supervisorEmail;
    private String supervisorPhone;
    private Boolean isSignedStudent;
    private Boolean isSignedEmployer;
    private Boolean isSignedInternshipManager;
    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private Long employerId;
    private String employerCompany;
    private Long internshipOfferId;
    private String internshipOfferTitle;

    public static InternshipContractDTO fromEntity(InternshipContract internshipContract) {
        return InternshipContractDTO.builder()
            .id(internshipContract.getId())
            .startDate(internshipContract.getStartDate())
            .endDate(internshipContract.getEndDate())
            .weeklyHours(internshipContract.getWeeklyHours())
            .tasks(internshipContract.getTasks())
            .educationalObjectives(internshipContract.getEducationalObjectives())
            .supervisorName(internshipContract.getSupervisorName())
            .supervisorTitle(internshipContract.getSupervisorTitle())
            .supervisorEmail(internshipContract.getSupervisorEmail())
            .supervisorPhone(internshipContract.getSupervisorPhone())
            .build();
    }
}
