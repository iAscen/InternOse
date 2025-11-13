package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.Employer;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
public class EmployerDTO extends UserDTO {
    private String company;

    public static EmployerDTO fromEntity(Employer employer) {
        return EmployerDTO.builder()
            .id(employer.getId())
            .firstName(employer.getFirstName())
            .lastName(employer.getLastName())
            .email(employer.getCredentials().getEmail())
            .password(employer.getCredentials().getPassword())
            .userRole(employer.getCredentials().getUserRole())
            .company(employer.getCompany())
            .build();
    }
}
