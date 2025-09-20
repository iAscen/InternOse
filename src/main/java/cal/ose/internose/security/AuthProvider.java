package cal.ose.internose.security;

import cal.ose.internose.modele.UserApp;
import cal.ose.internose.persistance.UserAppDAO;
import cal.ose.internose.security.exception.AuthenticationException;
import cal.ose.internose.security.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthProvider implements AuthenticationProvider{
	private final PasswordEncoder passwordEncoder;
	private final UserAppDAO userAppDAO;

	@Override
	public Authentication authenticate(Authentication authentication) {
		UserApp userApp = loadUserByEmail(authentication.getPrincipal().toString());
		validateAuthentication(authentication, userApp);
		return new UsernamePasswordAuthenticationToken(
			userApp.getEmail(),
			userApp.getPassword(),
			userApp.getAuthorities()
		);
	}

	@Override
	public boolean supports(Class<?> authentication){
		return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
	}

	private UserApp loadUserByEmail(String email) throws UsernameNotFoundException{
        System.out.println("loadUserByEmail: " + passwordEncoder.encode(email));
		return userAppDAO.findUserAppByEmail(email)
			.orElseThrow(UserNotFoundException::new);
	}

	private void validateAuthentication(Authentication authentication, UserApp userApp){
		if(!passwordEncoder.matches(authentication.getCredentials().toString(), userApp.getPassword()))
			throw new AuthenticationException(HttpStatus.FORBIDDEN, "Incorrect username or password");
	}
}
