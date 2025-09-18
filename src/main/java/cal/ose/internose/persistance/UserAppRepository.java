package cal.ose.internose.persistance;

import cal.ose.internose.modele.UserApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserAppRepository extends JpaRepository<UserApp, Long> {

    @Query("""
        select u from UserApp u where trim(u.credentials.email) = :email
    """)
    Optional<UserApp> findUserAppByEmail(@Param("email") String email);

}
