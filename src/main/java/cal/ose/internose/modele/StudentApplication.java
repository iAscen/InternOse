package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "STUDENT_APPLICATIONS")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class StudentApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne
    private Student student;
    @ManyToOne
    private InternshipOffer internshipOffer;
    private LocalDateTime applicationDate;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus applicationStatus = ApplicationStatus.PENDING;
    private String rejectionReason;

    public enum ApplicationStatus {
        PENDING,
        PENDING_INTERVIEW,
        APPROVED,
        REJECTED
    }

    @Override
    public String toString() {
        return "StudentApplication{" +
            "id=" + id +
//            ", student=" + student +
            ", internshipOffer=" + internshipOffer +
            ", applicationDate=" + applicationDate +
            ", applicationStatus=" + applicationStatus +
            '}';
    }
}
