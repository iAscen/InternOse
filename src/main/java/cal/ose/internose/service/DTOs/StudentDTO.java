package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.UserRole;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class StudentDTO extends UserAppDTO {
    public StudentDTO(String firstName, String lastName, String email, String password, UserRole userRole) {
        super(firstName, lastName, email, password, userRole);
    }
}
