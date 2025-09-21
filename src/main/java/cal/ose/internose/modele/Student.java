package cal.ose.internose.modele;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("S")
@Getter
@NoArgsConstructor
@SuperBuilder
public class Student extends UserApp {
}
