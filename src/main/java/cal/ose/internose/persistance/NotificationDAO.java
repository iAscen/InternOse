package cal.ose.internose.persistance;

import cal.ose.internose.modele.Notification;
import cal.ose.internose.modele.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationDAO extends JpaRepository<Notification, Long> {

    List<Notification> findByUser(User user);
}
