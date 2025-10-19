package cal.ose.internose.modele;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("E")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
public class Employer extends User {
    @Column(nullable = false)
    private String enterprise;
}
