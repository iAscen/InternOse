package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Role;
import cal.ose.internose.modele.StudentApplication;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class StudentDTO extends UserAppDTO {
    private DocumentStatus cvStatus;
    private byte[] cvFileData;
    private String cvFileName;
    private String program;
    private String institution;
    private LocalDateTime applicationDate;
    private StudentApplication.ApplicationStatus applicationStatus;

    public StudentDTO(Long id, String firstName, String lastName, String email, String password, Role role, DocumentStatus cvStatus) {
        super(id, firstName, lastName, email, password, role);
        this.cvStatus = cvStatus;
    }
}
