package cal.ose.internose.persistance;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InternshipOfferDAO extends JpaRepository<InternshipOffer, Long> {
    List<InternshipOffer> findAllByEmployer(Employer employer);
    List<InternshipOffer> findAllByEmployerAndSessionNot(Employer employer, String session);
    List<InternshipOffer> findAllByProgramLikeAndTitleLikeAndSessionLike(String program, String title, String session);
    List<InternshipOffer> findAllByProgramLikeAndTitleLikeAndSessionLikeOrderByVerificationStatusAsc(String program, String title, String session);
}
