package cal.ose.internose.modele;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "PROFESSORS")
@DiscriminatorValue("P")
@NoArgsConstructor
@SuperBuilder
@Getter
public class Professor extends User {
}
