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
    // TODO Décider de garder ou enlever
//    private String internshipAgreementFileName;
//    private String internshipAgreementFileType;
//    private byte[] internshipAgreementFileData;
    private Boolean isSignedStudent;
    private Boolean isSignedEmployer;
    private Boolean isSignedInternshipManager;

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
//            .internshipAgreementFileName(internshipContract.getInternshipAgreementFileName())
//            .internshipAgreementFileType(internshipContract.getInternshipAgreementFileType())
//            .internshipAgreementFileData(internshipContract.getInternshipAgreementFileData())
            .build();
    }
}
