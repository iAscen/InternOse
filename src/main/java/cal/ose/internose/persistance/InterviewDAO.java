package cal.ose.internose.persistance;

import cal.ose.internose.modele.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InterviewDAO extends JpaRepository<Interview, Long> {
    @Query("SELECT i FROM Interview i WHERE i.studentApplication.id = :applicationId")
    Optional<Interview> findByStudentApplicationId(@Param("applicationId") Long applicationId);

    @Query("SELECT i FROM Interview i WHERE i.studentApplication.student.id = :studentId")
    List<Interview> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT i FROM Interview i WHERE i.studentApplication.internshipOffer.employer.id = :employerId")
    List<Interview> findByEmployerId(@Param("employerId") Long employerId);

    boolean existsByStudentApplicationId(Long applicationId);
}
