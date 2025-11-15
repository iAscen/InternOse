package cal.ose.internose.persistance;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.StudentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InternshipOfferDAO extends JpaRepository<InternshipOffer, Long> {
    List<InternshipOffer> findAllByEmployer(Employer employer);
    List<InternshipOffer> findAllByProgramLikeAndTitleLike(String program, String title);
    List<InternshipOffer> findAllByProgramLikeAndTitleLikeOrderByVerificationStatusAsc(String program, String title);
}
