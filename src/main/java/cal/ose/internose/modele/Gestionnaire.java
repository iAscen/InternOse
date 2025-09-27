package cal.ose.internose.modele;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("G")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Gestionnaire extends UserApp{
}
