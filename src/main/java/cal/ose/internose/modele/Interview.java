package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "INTERVIEWS")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_application_id", nullable = false)
    private StudentApplication studentApplication;

    @Column(nullable = false)
    private LocalDateTime interviewDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewMode interviewMode;

    @Column(length = 500)
    private String location;

    @Column(length = 1000)
    private String personalizedMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    public enum InterviewMode {
        IN_PERSON,
        ONLINE
    }

    public enum InterviewStatus {
        SCHEDULED,
        COMPLETED,
        CANCELLED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
