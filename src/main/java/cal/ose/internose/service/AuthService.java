package cal.ose.internose.service;

import cal.ose.internose.modele.Credentials;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.Role;
import cal.ose.internose.persistance.EmployerRepository;
import cal.ose.internose.persistance.UserAppRepository;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.service.exception.UserAlreadyExistsException;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.LoginDTO;
import cal.ose.internose.service.exception.RequiredFieldException;
import cal.ose.internose.service.exception.WeakPasswordException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAppRepository userAppRepository;
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public String registerEmployer(EmployerDTO employerDTO) {
        try {
            if (employerDTO.getPassword().length() < 8 ||
                    !employerDTO.getPassword().matches(".*[A-Z].*") ||
                    !employerDTO.getPassword().matches(".*[0-9].*") ||
                    !employerDTO.getPassword().matches(".*[!@#$%^&()_+\\-=\\[\\]{};':|,.<>/?].*")) {
                throw new WeakPasswordException("Mot de passe trop faible. Doit inclure une lettre majuscule, un numero, un symbole speciale et doit avoir une taille de 8");
            }

            if (userAppRepository.findUserAppByEmail(employerDTO.getEmail()).isPresent()) {
                throw new UserAlreadyExistsException(
                        String.format("L'utilisateur avec l'email %s existe deja.", employerDTO.getEmail())
                );
            }

            employerRepository.save(
                    Employer.builder()
                            .credentials(new Credentials(employerDTO.getEmail(),
                                    passwordEncoder.encode(employerDTO.getPassword()), Role.EMPLOYER))
                            .firstName(employerDTO.getFirstName())
                            .lastName(employerDTO.getLastName())
                            .enterprise(employerDTO.getEnterprise())
                            .build()
            );

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    employerDTO.getEmail(), employerDTO.getPassword()
            );


            return jwtTokenProvider.generateToken(
                    authentication
            );
        }
        catch (DataIntegrityViolationException e) {
            throw new RequiredFieldException("Il y a des champs manquants.");
        }
    }

    public String authenticateUser(LoginDTO loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));
        return jwtTokenProvider.generateToken(authentication);
    }
}
