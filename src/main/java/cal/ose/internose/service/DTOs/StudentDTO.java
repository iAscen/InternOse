package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class StudentDTO extends UserAppDTO {
    private DocumentStatus cvStatus;
    private byte[] cvFileData;
    private String program;
    private String institution;

    public StudentDTO(Long id, String firstName, String lastName, String email, String password, Role role, DocumentStatus cvStatus) {
        super(id, firstName, lastName, email, password, role);
        this.cvStatus = cvStatus;
    }
}
