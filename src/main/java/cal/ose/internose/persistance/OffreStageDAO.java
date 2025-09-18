package cal.ose.internose.persistance;

import cal.ose.internose.modele.OffreStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OffreStageDAO extends JpaRepository<OffreStage, Long> {}
