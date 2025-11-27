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
    private String professorFirstName;
    private String professorLastName;
    private String professorEmail;
    private Long professorId;
    private String studentEmail;
    private String studentProgram;
    private String internshipOfferAddress;
    private String internshipOfferSession;

    public static InternshipContractDTO fromEntity(InternshipContract contract) {
        return InternshipContractDTO.builder()
            .id(contract.getId())
            .tasks(contract.getTasks())
            .supervisorEmail(contract.getSupervisorEmail())
            .supervisorPhone(contract.getSupervisorPhone())
            .supervisorName(contract.getSupervisorName())
            .supervisorTitle(contract.getSupervisorTitle())
            .weeklyHours(contract.getWeeklyHours())
            .startDate(contract.getStartDate())
            .endDate(contract.getEndDate())
            .educationalObjectives(contract.getEducationalObjectives())
            .isSignedStudent(contract.getIsSignedStudent())
            .isSignedEmployer(contract.getIsSignedEmployer())
            .isSignedInternshipManager(contract.getIsSignedInternshipManager())
            .studentId(contract.getStudent() != null ? contract.getStudent().getId() : null)
            .studentFirstName(contract.getStudent() != null ? contract.getStudent().getFirstName() : null)
            .studentLastName(contract.getStudent() != null ? contract.getStudent().getLastName() : null)
            .employerId(contract.getEmployer() != null ? contract.getEmployer().getId() : null)
            .employerCompany(contract.getEmployer() != null ? contract.getEmployer().getCompany() : null)
            .internshipOfferId(contract.getInternshipOffer() != null ? contract.getInternshipOffer().getId() : null)
            .internshipOfferTitle(contract.getInternshipOffer() != null ? contract.getInternshipOffer().getTitle() : null)
            .professorFirstName(contract.getProfessor() != null ? contract.getProfessor().getFirstName() : null)
            .professorLastName(contract.getProfessor() != null ? contract.getProfessor().getLastName() : null)
            .professorEmail(contract.getProfessor() != null ? contract.getProfessor().getEmail() : null)
            .professorId(contract.getProfessor() != null ? contract.getProfessor().getId() : null)
            .studentEmail(contract.getStudent() != null ? contract.getStudent().getEmail() : null)
            .studentProgram(contract.getStudent() != null ? contract.getStudent().getProgram() : null)
            .internshipOfferAddress(contract.getInternshipOffer() != null ? contract.getInternshipOffer().getAddress() : null)
            .internshipOfferSession(contract.getInternshipOffer() != null ? contract.getInternshipOffer().getSession() : null)
            .build();
    }

}
