package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
public class InternshipContract {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private int weeklyHours;
    private String tasks;
    private String educationalObjectives;
    private String supervisorName;
    private String supervisorTitle;
    private String supervisorEmail;
    private String supervisorPhone;
    @ManyToOne
    private Student student;
    @ManyToOne
    private Employer employer;
    @ManyToOne
    private InternshipOffer internshipOffer;
}

