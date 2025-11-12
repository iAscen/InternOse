package cal.ose.internose.persistance;

import cal.ose.internose.modele.InternAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InternAssessmentDAO extends JpaRepository<InternAssessment, Long> {
}
