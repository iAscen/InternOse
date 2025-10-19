package cal.ose.internose.modele;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("I")
@NoArgsConstructor
@SuperBuilder
@Getter
public class InternshipManager extends User {
}
