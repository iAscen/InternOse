package cal.ose.internose.persistance;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface InternshipOfferDAO extends JpaRepository<InternshipOffer, Long> {
    List<InternshipOffer> findAllByEmployer(Employer employer);

    @Query(
            "SELECT io FROM InternshipOffer io " +
            "WHERE (:domain IS NULL OR io.program LIKE :domain) " +
            "AND (:valid IS NULL OR io.validationStatus = :valid) " +
            "AND (:title IS NULL OR io.jobTitle LIKE :title)"
    )
    List<InternshipOffer> findInternshipsBy(@Param("domain") String domain,
                                            @Param("valid") DocumentStatus valid,
                                            @Param("title") String title);

    InternshipOffer findInternshipOfferById(Long id);

    // Méthode pour rechercher les offres de stage avec filtres avancés
    @Query(
            "SELECT io FROM InternshipOffer io " +
            "WHERE io.validationStatus = :status " +
            "AND (:program IS NULL OR LOWER(io.program) LIKE :program) " +
            "AND (:location IS NULL OR LOWER(io.address) LIKE :location) " +
            "AND (:jobTitle IS NULL OR LOWER(io.jobTitle) LIKE :jobTitle) " +
            "AND (:company IS NULL OR LOWER(io.employer.enterprise) LIKE :company) " +
            "AND (:minSalary IS NULL OR io.salary >= :minSalary) " +
            "AND (:maxSalary IS NULL OR io.salary <= :maxSalary) " +
            "AND (:minDuration IS NULL OR io.duration >= :minDuration) " +
            "AND (:maxDuration IS NULL OR io.duration <= :maxDuration) " +
            "AND (:startDateFrom IS NULL OR io.startDate >= :startDateFrom) " +
            "AND (:startDateTo IS NULL OR io.startDate <= :startDateTo)"
    )
    Page<InternshipOffer> findInternshipOffersWithFilters(
            @Param("status") DocumentStatus status,
            @Param("program") String program,
            @Param("location") String location,
            @Param("jobTitle") String jobTitle,
            @Param("company") String company,
            @Param("minSalary") Double minSalary,
            @Param("maxSalary") Double maxSalary,
            @Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration,
            @Param("startDateFrom") LocalDate startDateFrom,
            @Param("startDateTo") LocalDate startDateTo,
            Pageable pageable
    );

    // Méthode pour compter les offres avec filtres (pour pagination)
    @Query(
            "SELECT COUNT(io) FROM InternshipOffer io " +
            "WHERE io.validationStatus = :status " +
            "AND (:program IS NULL OR LOWER(io.program) LIKE :program) " +
            "AND (:location IS NULL OR LOWER(io.address) LIKE :location) " +
            "AND (:jobTitle IS NULL OR LOWER(io.jobTitle) LIKE :jobTitle) " +
            "AND (:company IS NULL OR LOWER(io.employer.enterprise) LIKE :company) " +
            "AND (:minSalary IS NULL OR io.salary >= :minSalary) " +
            "AND (:maxSalary IS NULL OR io.salary <= :maxSalary) " +
            "AND (:minDuration IS NULL OR io.duration >= :minDuration) " +
            "AND (:maxDuration IS NULL OR io.duration <= :maxDuration) " +
            "AND (:startDateFrom IS NULL OR io.startDate >= :startDateFrom) " +
            "AND (:startDateTo IS NULL OR io.startDate <= :startDateTo)"
    )
    long countInternshipOffersWithFilters(
            @Param("status") DocumentStatus status,
            @Param("program") String program,
            @Param("location") String location,
            @Param("jobTitle") String jobTitle,
            @Param("company") String company,
            @Param("minSalary") Double minSalary,
            @Param("maxSalary") Double maxSalary,
            @Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration,
            @Param("startDateFrom") LocalDate startDateFrom,
            @Param("startDateTo") LocalDate startDateTo
    );

    // Méthode pour rechercher les offres de stage SANS filtres de date
    @Query(
            "SELECT io FROM InternshipOffer io " +
            "WHERE io.validationStatus = :status " +
            "AND (:program IS NULL OR LOWER(io.program) LIKE :program) " +
            "AND (:location IS NULL OR LOWER(io.address) LIKE :location) " +
            "AND (:jobTitle IS NULL OR LOWER(io.jobTitle) LIKE :jobTitle) " +
            "AND (:company IS NULL OR LOWER(io.employer.enterprise) LIKE :company) " +
            "AND (:minSalary IS NULL OR io.salary >= :minSalary) " +
            "AND (:maxSalary IS NULL OR io.salary <= :maxSalary) " +
            "AND (:minDuration IS NULL OR io.duration >= :minDuration) " +
            "AND (:maxDuration IS NULL OR io.duration <= :maxDuration)"
    )
    Page<InternshipOffer> findInternshipOffersWithoutDates(
            @Param("status") DocumentStatus status,
            @Param("program") String program,
            @Param("location") String location,
            @Param("jobTitle") String jobTitle,
            @Param("company") String company,
            @Param("minSalary") Double minSalary,
            @Param("maxSalary") Double maxSalary,
            @Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration,
            Pageable pageable
    );

    // Méthode pour compter les offres SANS filtres de date
    @Query(
            "SELECT COUNT(io) FROM InternshipOffer io " +
            "WHERE io.validationStatus = :status " +
            "AND (:program IS NULL OR LOWER(io.program) LIKE :program) " +
            "AND (:location IS NULL OR LOWER(io.address) LIKE :location) " +
            "AND (:jobTitle IS NULL OR LOWER(io.jobTitle) LIKE :jobTitle) " +
            "AND (:company IS NULL OR LOWER(io.employer.enterprise) LIKE :company) " +
            "AND (:minSalary IS NULL OR io.salary >= :minSalary) " +
            "AND (:maxSalary IS NULL OR io.salary <= :maxSalary) " +
            "AND (:minDuration IS NULL OR io.duration >= :minDuration) " +
            "AND (:maxDuration IS NULL OR io.duration <= :maxDuration)"
    )
    long countInternshipOffersWithoutDates(
            @Param("status") DocumentStatus status,
            @Param("program") String program,
            @Param("location") String location,
            @Param("jobTitle") String jobTitle,
            @Param("company") String company,
            @Param("minSalary") Double minSalary,
            @Param("maxSalary") Double maxSalary,
            @Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration
    );

    // Méthode pour récupérer une offre spécifique avec ses détails
    @Query(
            "SELECT io FROM InternshipOffer io " +
            "LEFT JOIN FETCH io.employer " +
            "WHERE io.id = :id AND io.validationStatus = :status"
    )
    InternshipOffer findByIdAndStatus(@Param("id") Long id, @Param("status") DocumentStatus status);
}
