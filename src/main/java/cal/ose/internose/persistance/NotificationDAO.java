package cal.ose.internose.persistance;

import cal.ose.internose.modele.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationDAO extends JpaRepository<Notification, Long> {
}
