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
            "AND (:applicationStatus IS NULL OR sa.applicationStatus = :applicationStatus) " +
            "AND (:program IS NULL OR s.program = :program) " +
            "AND (:institution IS NULL OR s.institution = :institution)"
    )
    List<StudentApplication> findApplicationsBy(
        @Param("internshipOfferID") Long internshipOfferID,
        @Param("applicationStatus") StudentApplication.ApplicationStatus applicationStatus,
        @Param("institution") String institution,
        @Param("program") String program
    );

    boolean existsByStudentIdAndInternshipOfferId(long studentId, long internshipOfferId);
    
    List<StudentApplication> findByStudentId(Long studentId);
    
    java.util.Optional<StudentApplication> findByStudentIdAndInternshipOfferId(Long studentId, Long internshipOfferId);
}
