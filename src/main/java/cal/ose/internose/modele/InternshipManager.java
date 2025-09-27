package cal.ose.internose.modele;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("G")
@Getter
@NoArgsConstructor
@SuperBuilder
public class InternshipManager extends UserApp{
}
