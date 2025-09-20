package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class UserAppDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;

    public UserAppDTO(String firstName, String lastName, String email, String password, Role role) {
        super();
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}
