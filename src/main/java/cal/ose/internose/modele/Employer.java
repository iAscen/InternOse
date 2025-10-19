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
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Employer extends UserApp {
    @Column(name = "enterprise", nullable = false, columnDefinition = "VARCHAR(255)")
    private String enterprise;

    public Employer(Long id, String firstName, String lastName, Credentials credentials, String enterprise) {
        super(id, firstName, lastName, credentials);
        this.enterprise = enterprise;
    }
}
