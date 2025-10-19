package cal.ose.internose.service.DTOs;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
@Setter
public class EmployerDTO extends UserDTO {
    private String enterprise;
}
