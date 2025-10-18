package cal.ose.internose.modele;

import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

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
    @Column(name = "job_title", columnDefinition = "VARCHAR(255)")
    private String jobTitle;
    
    @Column(name = "task_description", columnDefinition = "TEXT")
    private String taskDescription;
    
    @Column(name = "program", columnDefinition = "VARCHAR(255)")
    private String program;
    
    @Column(name = "qualifications", columnDefinition = "TEXT")
    private String qualifications;
    
    @Column(name = "duration", columnDefinition = "INTEGER")
    private int duration;
    
    @Column(name = "start_date", columnDefinition = "DATE")
    private LocalDate startDate;
    
    @Column(name = "end_date", columnDefinition = "DATE")
    private LocalDate endDate;
    
    @Column(name = "salary", columnDefinition = "DECIMAL(10,2)")
    private double salary;
    
    @Column(name = "address", columnDefinition = "VARCHAR(255)")
    private String address;
    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status")
    @Builder.Default
    private DocumentStatus validationStatus = DocumentStatus.NONE;

    @Column(name = "offer_rejection_reason", length = 2000)
    private String rejectionReason;

    @ManyToMany
    @JoinTable(
            name = "student_internship_offer",
            joinColumns = @JoinColumn(name = "offer_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private List<Student> students;

    public boolean isValidee() {
        return validationStatus != DocumentStatus.PENDING;
    }

    public static InternshipOffer fromDTO(InternshipOfferDTO internshipOfferDTO) {
        return InternshipOffer.builder()
            .jobTitle(internshipOfferDTO.getJobTitle())
            .taskDescription(internshipOfferDTO.getTaskDescription())
            .program(internshipOfferDTO.getProgram())
            .qualifications(internshipOfferDTO.getQualifications())
            .duration(internshipOfferDTO.getDuration())
            .startDate(internshipOfferDTO.getStartDate())
            .endDate(
                internshipOfferDTO.getStartDate().plusWeeks(internshipOfferDTO.getDuration())
            )
            .salary(internshipOfferDTO.getSalary())
            .address(internshipOfferDTO.getAddress())
            .validationStatus(internshipOfferDTO.getValidationStatus())
            .rejectionReason(internshipOfferDTO.getRejectionReason())
            .build();
    }
}
