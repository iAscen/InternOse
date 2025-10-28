package cal.ose.internose.persistance;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.StudentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentApplicationDAO extends JpaRepository<StudentApplication, Long> {
    // C'est le nom de fonction le plus court!!
    List<StudentApplication> findAllByInternshipOfferAndApplicationStatusAndStudentInstitutionAndStudentProgram(
        InternshipOffer internshipOffer,
        StudentApplication.ApplicationStatus applicationStatus,
        String institution,
        String program
    );
    List<StudentApplication> findByStudent(Student student);
    Optional<StudentApplication> findByStudentAndInternshipOffer(Student student, InternshipOffer internshipOffer);
    boolean existsByStudentAndInternshipOffer(Student student, InternshipOffer internshipOffer);
}
