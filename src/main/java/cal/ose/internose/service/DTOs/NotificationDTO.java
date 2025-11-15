package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.NotificationType;
import cal.ose.internose.modele.User;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@Builder
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String message;
    private NotificationType type;
    private LocalDateTime createdAt;
    private boolean checked;
}
