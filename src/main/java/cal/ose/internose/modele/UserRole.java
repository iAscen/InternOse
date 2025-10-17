package cal.ose.internose.modele;

import lombok.AllArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@ToString
public enum UserRole {
	EMPLOYER("EMPLOYER"),
    STUDENT("STUDENT"),
    INTERNSHIP_MANAGER("INTERNSHIP_MANAGER"),;

	private final String userRole;
}
