package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.Role;
import lombok.*;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@SuperBuilder
@Getter
@Setter
public class InternshipManagerDTO extends UserAppDTO {
    public InternshipManagerDTO(Long id, String firstName, String lastName,
                                String email, String password, Role role) {
        super(id, firstName, lastName, email, password, role);
    }
}
