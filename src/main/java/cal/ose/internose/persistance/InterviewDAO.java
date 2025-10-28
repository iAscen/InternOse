package cal.ose.internose.persistance;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.Interview;
import cal.ose.internose.modele.StudentApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewDAO extends JpaRepository<Interview, Long> {
    Optional<Interview> findByStudentApplication(StudentApplication studentApplication);
    List<Interview> findAllByStudentApplicationInternshipOfferEmployer(Employer employer);
    boolean existsByStudentApplication(StudentApplication studentApplication);
}
