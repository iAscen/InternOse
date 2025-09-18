package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class EmployerDTO extends UserAppDTO{
    private String enterprise;

    public EmployerDTO( String firstName, String lastName, String email, String password, Role role, String enterprise) {
        super(firstName, lastName, email, password, role);
        this.enterprise = enterprise;
    }


}
