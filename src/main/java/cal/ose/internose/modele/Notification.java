package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String message;
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    private LocalDateTime createdAt;
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;
    @Builder.Default
    @Setter
    private boolean checked = false;
}
