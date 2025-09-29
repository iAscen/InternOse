package cal.ose.internose.persistance;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InternshipOfferDAO extends JpaRepository<InternshipOffer, Long> {
    List<InternshipOffer> findAllByEmployer(Employer employer);

    @Query(
            "SELECT io FROM InternshipOffer io " +
            "WHERE (:domain IS NULL OR io.domain = :domain) " +
            "AND (:valid IS NULL OR io.validee = :valid) " +
            "AND (:enterprise IS NULL OR io.employer.enterprise = :enterprise)"
    )
    List<InternshipOffer> findInternshipsBy(@Param("domain") String domain,
                                            @Param("valid") Boolean valid,
                                            @Param("enterprise") String enterprise);

    InternshipOffer findInternshipOfferById(Long id);
}
