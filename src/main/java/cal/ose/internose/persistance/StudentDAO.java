package cal.ose.internose.persistance;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentDAO extends JpaRepository<Student, Long> {

    @Query(
            "SELECT s FROM Student s JOIN s.internshipOffers io " +
                    "WHERE (:cvStatus IS NULL OR s.cvStatus = :cvStatus) " +
                    "AND (:program IS NULL OR s.program = :program) " +
                    "AND (:institution IS NULL OR s.institution = :institution) " +
                    "AND io.id = :internshipId"
    )
    List<Student> findStudentsBy(@Param("internshipId") long internshipId,
                                 @Param("cvStatus") DocumentStatus cvStatus,
                                 @Param("program") String program,
                                 @Param("institution") String institution);
}
