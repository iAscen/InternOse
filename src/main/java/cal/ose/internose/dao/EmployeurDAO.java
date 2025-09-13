package cal.ose.internose.dao;

import cal.ose.internose.modele.Employeur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeurDAO extends JpaRepository<Employeur, Long> {
}
