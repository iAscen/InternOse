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
            "WHERE (:program IS NULL OR io.program LIKE :program) " +
            "AND (:verified IS NULL OR io.verificationStatus = :verified) " +
            "AND (:title IS NULL OR io.title LIKE :title)"
    )
    List<InternshipOffer> findInternshipsBy(
        @Param("verified") Boolean validated, @Param("program") String program, @Param("title") String title
    );
}
