package cal.ose.internose.persistance;

import cal.ose.internose.modele.InternshipManager;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternshipManagerDAO extends JpaRepository<InternshipManager, Long> {
}
