package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.UserAppDAO;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.service.DTOs.*;
import cal.ose.internose.service.exceptions.ErrorMessages;
import cal.ose.internose.service.exceptions.UserAlreadyExistsException;
import cal.ose.internose.service.exceptions.RequiredFieldException;
import cal.ose.internose.service.exceptions.WeakPasswordException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAppDAO userAppDAO;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public String registerInternshipManager(InternshipManagerDTO internshipManagerDTO) {
        InternshipManager internshipManager = InternshipManager.builder()
            .credentials(
                new Credentials(internshipManagerDTO.getEmail(), passwordEncoder.encode(internshipManagerDTO.getPassword()), Role.INTERNSHIP_MANAGER)
            )
            .firstName(internshipManagerDTO.getFirstName())
            .lastName(internshipManagerDTO.getLastName())
            .build();

        return registerUser(internshipManagerDTO.getEmail(), internshipManagerDTO.getPassword(), internshipManager);
    }

    @Transactional
    public String registerEmployer(EmployerDTO employerDTO) {
        Employer employer = Employer.builder()
            .credentials(
                new Credentials(employerDTO.getEmail(), passwordEncoder.encode(employerDTO.getPassword()), Role.EMPLOYER)
            )
            .firstName(employerDTO.getFirstName())
            .lastName(employerDTO.getLastName())
            .enterprise(employerDTO.getEnterprise())
            .build();

        return registerUser(employerDTO.getEmail(), employerDTO.getPassword(), employer);
    }

    @Transactional
    public String registerStudent(StudentDTO studentDTO) {
        Student student = Student.builder()
            .credentials(
                new Credentials(studentDTO.getEmail(), passwordEncoder.encode(studentDTO.getPassword()), Role.STUDENT)
            )
            .firstName(studentDTO.getFirstName())
            .lastName(studentDTO.getLastName())
            .institution(studentDTO.getInstitution())
            .program(studentDTO.getProgram())
            .build();

        return registerUser(studentDTO.getEmail(), studentDTO.getPassword(), student);
    }

    public String login(LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginDTO.getEmail(),
                loginDTO.getPassword()
            )
        );

        // Récupérer l'ID de l'utilisateur depuis la base de données
        UserApp user = userAppDAO.findUserAppByEmail(loginDTO.getEmail())
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return jwtTokenProvider.generateToken(
            authentication, user.getId(), user.getFirstName(), user.getLastName()
        );
    }

    private String registerUser(String email, String password, UserApp user) {
        try {
            validatePassword(password);

            if (userAppDAO.findUserAppByEmail(email).isPresent()) {
                throw new UserAlreadyExistsException(
                    String.format(ErrorMessages.EMAIL_ALREADY_EXISTS.getMessage(), email)
                );
            }

            UserApp savedUser = userAppDAO.save(user);

            Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);

            return jwtTokenProvider.generateToken(
                authentication, savedUser.getId(), savedUser.getFirstName(), savedUser.getLastName()
            );
        } catch (DataIntegrityViolationException e) {
            throw new RequiredFieldException(ErrorMessages.REQUIRED_FIELDS_MISSING.getMessage());
        }
    }

    public void validatePassword(String password) {
        if (password.length() < 8) {
            throw new WeakPasswordException(ErrorMessages.PASSWORD_TOO_SHORT.getMessage());
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new WeakPasswordException(ErrorMessages.PASSWORD_MISSING_UPPER.getMessage());
        }
        if (!password.matches(".*[0-9].*")) {
            throw new WeakPasswordException(ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage());
        }
        if (!password.matches(".*[!@#$%^&()_+\\-=\\[\\]{};':|,.<>/?].*")) {
            throw new WeakPasswordException(ErrorMessages.PASSWORD_MISSING_SPECIAL.getMessage());
        }
    }
}
