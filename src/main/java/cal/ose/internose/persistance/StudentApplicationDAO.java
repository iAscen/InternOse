package cal.ose.internose.persistance;

import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.modele.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentApplicationDAO extends JpaRepository<StudentApplication, Long> {
    @Query(
        "SELECT sa FROM StudentApplication sa " +
            "JOIN sa.student s " +
            "WHERE sa.internshipOffer.id = :internshipOfferID " +
            "AND (:verificationStatus IS NULL OR s.resumeVerificationStatus = :verificationStatus) " +
            "AND (:program IS NULL OR s.program = :program) " +
            "AND (:institution IS NULL OR s.institution = :institution)"
    )
    List<StudentApplication> findApplicationsBy(
        @Param("internshipOfferID") Long internshipOfferID,
        @Param("verificationStatus") VerificationStatus verificationStatus,
        @Param("institution") String institution,
        @Param("program") String program
    );

    boolean existsByStudentIdAndInternshipOfferId(long studentId, long internshipOfferId);
}
