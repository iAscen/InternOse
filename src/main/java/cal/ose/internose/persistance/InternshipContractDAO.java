package cal.ose.internose.persistance;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipContract;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InternshipContractDAO extends JpaRepository<InternshipContract, Long> {
    Optional<InternshipContract> findByStudentAndInternshipOffer(Student student, InternshipOffer internshipOffer);
    Optional<InternshipContract> findByStudentAndEmployerAndInternshipOffer(Student student, Employer employer, InternshipOffer internshipOffer);
}
