package cal.ose.internose.persistance;

import cal.ose.internose.modele.Employer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployerRepository extends JpaRepository<Employer, Long> {
}
