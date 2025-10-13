package cal.ose.internose.persistance;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.StudentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentApplicationDAO extends JpaRepository<StudentApplication, Long> {

    @Query(
            "SELECT sa FROM StudentApplication sa " +
            "JOIN sa.student s " +
            "WHERE sa.internshipOffer.id = :internshipId " +
            "AND (:cvStatus IS NULL OR s.cvStatus = :cvStatus) " +
            "AND (:program IS NULL OR s.program = :program) " +
            "AND (:institution IS NULL OR s.institution = :institution)"
    )
    List<StudentApplication> findApplicationsBy(@Param("internshipId") long internshipId,
                                               @Param("cvStatus") DocumentStatus cvStatus,
                                               @Param("program") String program,
                                               @Param("institution") String institution);
}
