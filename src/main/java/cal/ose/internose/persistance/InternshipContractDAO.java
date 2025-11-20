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

    @Query("SELECT io FROM InternshipContract io WHERE io.professor = :professor AND io.internshipOffer.session = :session")
    List<InternshipContract> findByProfessorAndSession(@Param("professor") Professor professor, @Param("session") String session);
}
