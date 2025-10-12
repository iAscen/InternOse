package cal.ose.internose.persistance;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentDAO extends JpaRepository<Student, Long> {

    @Query(
            "SELECT s FROM Student s JOIN s.internshipOffers io WHERE (:status IS NULL OR s.cvStatus = :status) AND io.id = :internshipId"
    )
    List<Student> findStudentsBy(@Param("internshipId") long internshipId, @Param("status") DocumentStatus status);
}
