package cal.ose.internose.persistance;

import cal.ose.internose.modele.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipContractDAO extends JpaRepository<InternshipContract, Long> {
    Optional<InternshipContract> findByStudentAndInternshipOffer(Student student, InternshipOffer internshipOffer);
    Optional<InternshipContract> findByStudentAndEmployerAndInternshipOffer(Student student, Employer employer, InternshipOffer internshipOffer);

    @Query("SELECT io FROM InternshipContract io WHERE io.professor = :professor " +
        "AND (:session IS NULL OR io.internshipOffer.session = :session) " +
        "AND (:student IS NULL OR :student LIKE CONCAT(io.student.firstName, ' ', io.student.lastName)) " +
        "AND (:company IS NULL OR :company LIKE io.employer.company) " +
        "AND (:program IS NULL OR :program LIKE io.internshipOffer.program)")
    List<InternshipContract> findAllByProfessorWithOptionalFilters(@Param("professor") Professor professor, @Param("session") String session, @Param("student") String studentName,
                                                                   @Param("company") String company, @Param("program") String internshipProgram);
}
