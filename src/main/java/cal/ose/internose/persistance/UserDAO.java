package cal.ose.internose.persistance;

import cal.ose.internose.modele.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserDAO extends JpaRepository<User, Long> {
    Optional<User> findByCredentials_Email(String email);
}
