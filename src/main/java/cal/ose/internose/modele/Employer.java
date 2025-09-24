package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("E")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Employer extends UserApp {
    @Column(nullable = false)
    private String enterprise;
    @OneToMany(mappedBy = "employer", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<InternshipOffer> internshipOffers = new ArrayList<>();

    public void addInternshipOffer(InternshipOffer internshipOffer) {
        this.internshipOffers.add(internshipOffer);
    }
}
