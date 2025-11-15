package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.Professor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@NoArgsConstructor
@SuperBuilder
@Getter
public class ProfessorDTO extends UserDTO {
    public static ProfessorDTO fromEntity(Professor professor) {
        return ProfessorDTO.builder()
            .id(professor.getId())
            .firstName(professor.getFirstName())
            .lastName(professor.getLastName())
            .email(professor.getCredentials().getEmail())
            .password(professor.getCredentials().getPassword())
            .userRole(professor.getCredentials().getUserRole())
            .build();
    }

    public static List<ProfessorDTO> fromEntityList(List<Professor> professors) {
        return professors.stream().map(ProfessorDTO::fromEntity).toList();
    }
}
