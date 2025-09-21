package cal.ose.internose.persistance;

import cal.ose.internose.modele.InternshipOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InternshipOfferDAO extends JpaRepository<InternshipOffer, Long> {}
