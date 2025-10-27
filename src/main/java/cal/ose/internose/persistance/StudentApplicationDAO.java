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
    @Query(
        "SELECT sa FROM StudentApplication sa " +
            "JOIN sa.student s " +
            "WHERE sa.internshipOffer.id = :internshipOfferID " +
            "AND (:applicationStatus IS NULL OR sa.applicationStatus = :applicationStatus) " +
            "AND (:program IS NULL OR s.program = :program) " +
            "AND (:institution IS NULL OR s.institution = :institution)"
    )
    List<StudentApplication> findBy(
        @Param("internshipOfferID") Long internshipOfferID,
        @Param("applicationStatus") StudentApplication.ApplicationStatus applicationStatus,
        @Param("institution") String institution,
        @Param("program") String program
    );

    List<StudentApplication> findByStudent(Student student);

    Optional<StudentApplication> findByStudentAndInternshipOffer(Student student, InternshipOffer internshipOffer);

    boolean existsByStudentAndInternshipOffer(Student student, InternshipOffer internshipOffer);
}
