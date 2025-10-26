package cal.ose.internose.persistance;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.Interview;
import cal.ose.internose.modele.StudentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InterviewDAO extends JpaRepository<Interview, Long> {
    @Query("SELECT i FROM Interview i WHERE i.studentApplication = :studentApplication")
    Optional<Interview> findByStudentApplication(@Param("studentApplication") StudentApplication studentApplication);

    @Query("SELECT i FROM Interview i WHERE i.studentApplication.internshipOffer.employer = :employer")
    List<Interview> findByEmployer(@Param("employer") Employer employer);

    boolean existsByStudentApplication(StudentApplication studentApplication);
}
