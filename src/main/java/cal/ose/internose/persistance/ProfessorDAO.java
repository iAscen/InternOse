package cal.ose.internose.persistance;

import cal.ose.internose.modele.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessorDAO extends JpaRepository<Professor, Long> {
}
