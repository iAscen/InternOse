package cal.ose.internose.persistance;

import cal.ose.internose.modele.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentDAO extends JpaRepository<Student, Long> {
    Student findByCredentials_Email(String email);
}
