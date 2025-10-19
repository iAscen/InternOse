package cal.ose.internose.modele;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "INTERNSHIP_MANAGERS")
@DiscriminatorValue("I")
@NoArgsConstructor
@SuperBuilder
@Getter
public class InternshipManager extends User {
}
