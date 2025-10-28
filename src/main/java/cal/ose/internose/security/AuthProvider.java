package cal.ose.internose.security;

import cal.ose.internose.modele.User;
import cal.ose.internose.persistance.UserDAO;
import cal.ose.internose.security.exceptions.AuthenticationException;
import cal.ose.internose.security.exceptions.UserNotFoundException;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AuthProvider implements AuthenticationProvider {
    private final PasswordEncoder passwordEncoder;
    private final UserDAO userDAO;

    public AuthProvider(PasswordEncoder passwordEncoder, @Lazy UserDAO userDAO) {
        this.passwordEncoder = passwordEncoder;
        this.userDAO = userDAO;
    }

    @Override
    public Authentication authenticate(Authentication authentication) {
        try {
            User user = loadUserByEmail(authentication.getPrincipal().toString());
            verifyAuthentication(authentication, user);
            return new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                user.getPassword(),
                user.getAuthorities()
            );
        } catch (UserNotFoundException | AuthenticationException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

    private User loadUserByEmail(String email) throws UserNotFoundException {
        return userDAO.findByCredentials_Email(email).orElseThrow(UserNotFoundException::new);
    }

    private void verifyAuthentication(Authentication authentication, User user) throws AuthenticationException {
        if (!passwordEncoder.matches(authentication.getCredentials().toString(), user.getPassword()))
            throw new AuthenticationException(HttpStatus.FORBIDDEN, "Incorrect username or password");
    }
}
