package cal.ose.internose.service.DTOs;

import lombok.Getter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
public class EmployerDTO extends UserDTO {
    private String company;
}
