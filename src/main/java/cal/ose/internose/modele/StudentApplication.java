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
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SeenStatus seenStatus = SeenStatus.NONE;

    public enum SeenStatus {
        UNSEEN,
        SEEN,
        NONE // On utilise NONE lorsque l'application n'est pas encore rendu au statut ACCEPTED_BY_STUDENT et REJECTED_BY_STUDENT
    }

    public enum ApplicationStatus {
        PENDING,
        PENDING_INTERVIEW,
        APPROVED,
        REJECTED,
        PENDING_ACCEPTANCE, // En attente d'acceptation de l'étudiant
        ACCEPTED_BY_STUDENT,
        REJECTED_BY_STUDENT,
        HIRED, // Embauché
        PENDING_CONTRACT
    }
}
