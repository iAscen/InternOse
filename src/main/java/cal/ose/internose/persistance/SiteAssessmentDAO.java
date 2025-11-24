package cal.ose.internose.persistance;

import cal.ose.internose.modele.InternshipContract;
import cal.ose.internose.modele.SiteAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteAssessmentDAO extends JpaRepository<SiteAssessment, Long> {
    SiteAssessment findByInternshipContract(InternshipContract internshipContract);
}

