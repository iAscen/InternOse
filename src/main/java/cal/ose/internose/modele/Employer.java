package cal.ose.internose.modele;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "EMPLOYERS")
@DiscriminatorValue("E")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
public class Employer extends User {
    @Column(nullable = false)
    private String company;
}
