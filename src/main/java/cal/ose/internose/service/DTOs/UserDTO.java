package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.UserRole;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
@Setter
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private UserRole userRole;
}
