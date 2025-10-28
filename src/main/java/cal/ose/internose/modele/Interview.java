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
    private StudentApplication studentApplication;
    private LocalDateTime interviewDate;
    @Enumerated(EnumType.STRING)
    private InterviewMode interviewMode;
    private String location;
    private String personalizedMessage;
    private LocalDateTime scheduleDate;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InterviewStatus interviewStatus = InterviewStatus.SCHEDULED;
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
    private void onCreate() {
        scheduleDate = LocalDateTime.now();
    }
}
