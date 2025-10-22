package cal.ose.internose.persistance;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InternshipOfferDAO extends JpaRepository<InternshipOffer, Long> {
    List<InternshipOffer> findAllByEmployer(Employer employer);

    @Query(
        "SELECT io FROM InternshipOffer io " +
            "WHERE (:program IS NULL OR io.program LIKE :program) " +
            "AND (:title IS NULL OR io.title LIKE :title)"
    )
    List<InternshipOffer> findAllInternshipsBy(
        @Param("program") String program, @Param("title") String title
    );

    @Query(
        "SELECT io FROM InternshipOffer io " +
            "WHERE (:program IS NULL OR io.program LIKE :program) " +
            "AND (:verified = true AND io.verificationStatus = 'APPROVED') OR " +
            "  (:verified = false AND io.verificationStatus = 'REJECTED') " +
            "AND (:title IS NULL OR io.title LIKE :title)"
    )
    List<InternshipOffer> findInternshipsBy(
        @Param("verified") Boolean verified, @Param("program") String program, @Param("title") String title
    );

    @Query(
        "SELECT io FROM InternshipOffer io " +
            "LEFT JOIN FETCH io.employer " +
            "WHERE io.id = :id AND io.verificationStatus = :status"
    )
    InternshipOffer findByIDAndStatus(@Param("id") Long id, @Param("status") VerificationStatus verificationStatus);

    @Query(
        "SELECT io FROM InternshipOffer io " +
            "WHERE io.verificationStatus = :status " +
            "AND (:title IS NULL OR LOWER(io.title) LIKE :title) " +
            "AND (:company IS NULL OR LOWER(io.employer.company) LIKE :company) " +
            "AND (:program IS NULL OR LOWER(io.program) LIKE :program) " +
            "AND (:minDuration IS NULL OR io.duration >= :minDuration) " +
            "AND (:maxDuration IS NULL OR io.duration <= :maxDuration)" +
            "AND (:minSalary IS NULL OR io.salary >= :minSalary) " +
            "AND (:maxSalary IS NULL OR io.salary <= :maxSalary) " +
            "AND (:address IS NULL OR LOWER(io.address) LIKE :address) "
    )
    Page<InternshipOffer> findInternshipOffersWithoutDates(
        @Param("status") VerificationStatus verificationStatus,
        @Param("title") String title,
        @Param("company") String company,
        @Param("program") String program,
        @Param("minDuration") Integer minDuration,
        @Param("maxDuration") Integer maxDuration,
        @Param("minSalary") Double minSalary,
        @Param("maxSalary") Double maxSalary,
        @Param("address") String address,
        Pageable pageable
    );

    @Query(
        "SELECT COUNT(io) FROM InternshipOffer io " +
            "WHERE io.verificationStatus = :status " +
            "AND (:title IS NULL OR LOWER(io.title) LIKE :title) " +
            "AND (:company IS NULL OR LOWER(io.employer.company) LIKE :company) " +
            "AND (:program IS NULL OR LOWER(io.program) LIKE :program) " +
            "AND (:minDuration IS NULL OR io.duration >= :minDuration) " +
            "AND (:maxDuration IS NULL OR io.duration <= :maxDuration)" +
            "AND (:minSalary IS NULL OR io.salary >= :minSalary) " +
            "AND (:maxSalary IS NULL OR io.salary <= :maxSalary) " +
            "AND (:address IS NULL OR LOWER(io.address) LIKE :address) "
    )
    Long countInternshipOffersWithoutDates(
        @Param("status") VerificationStatus verificationStatus,
        @Param("title") String title,
        @Param("company") String company,
        @Param("program") String program,
        @Param("minDuration") Integer minDuration,
        @Param("maxDuration") Integer maxDuration,
        @Param("minSalary") Double minSalary,
        @Param("maxSalary") Double maxSalary,
        @Param("address") String address
    );
}
