package cal.ose.internose.persistance;

import cal.ose.internose.modele.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserDAO extends JpaRepository<User, Long> {
    @Query("""
        SELECT u FROM User u WHERE trim(u.credentials.email) = :email
    """)
    Optional<User> findUserByEmail(@Param("email") String email);
}
