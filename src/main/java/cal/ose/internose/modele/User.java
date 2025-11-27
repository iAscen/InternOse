package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Entity
@Table(name = "USERS")
@Inheritance(strategy = InheritanceType.JOINED)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
@ToString
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(nullable = false)
    private String firstName;
    @Column(nullable = false)
    private String lastName;
    @Column(nullable = false)
    private String session;

    @Embedded
    private Credentials credentials;

    public String getEmail() {
        return credentials != null ? credentials.getEmail() : null;
    }

    public String getPassword() {
        return credentials != null ? credentials.getPassword() : null;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return credentials != null ? credentials.getAuthorities() : null;
    }
}
