package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_internship_application")
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
    @JoinColumn(name = "student_id")
    private Student student;
    
    @ManyToOne
    @JoinColumn(name = "internship_offer_id")
    private InternshipOffer internshipOffer;
    
    @Column(name = "application_date")
    private LocalDateTime applicationDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "application_status")
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    
    public enum ApplicationStatus {
        PENDING,    // En attente
        ACCEPTED,   // Acceptée
        REJECTED;

        public static ApplicationStatus of(String status) {
            if (status == null) return null;
            return switch (status.toUpperCase()) {
                case "PENDING" -> PENDING;
                case "ACCEPTED", "APPROVED" -> ACCEPTED;
                case "REJECTED" -> REJECTED;
                default -> null;
            };
        }
    }
}
