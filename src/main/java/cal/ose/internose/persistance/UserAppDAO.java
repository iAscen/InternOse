package cal.ose.internose.persistance;

import cal.ose.internose.modele.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserAppDAO extends JpaRepository<User, Long> {

    @Query("""
        select u from User u where trim(u.credentials.email) = :email
    """)
    Optional<User> findUserAppByEmail(@Param("email") String email);

}