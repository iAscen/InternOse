package cal.ose.internose.service;

import cal.ose.internose.modele.Credentials;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.Role;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.persistance.UserAppDAO;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exception.UserAlreadyExistsException;
import cal.ose.internose.service.DTOs.EmployerDTO;
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
    private final UserAppDAO userAppDAO;
    private final EmployerDAO employerDAO;
    private final StudentDAO studentDAO;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public String registerEmployer(EmployerDTO employerDTO) {
        try {
            validatePassword(employerDTO.getPassword());

            if (userAppDAO.findUserAppByEmail(employerDTO.getEmail()).isPresent()) {
                throw new UserAlreadyExistsException(
                        String.format("L'utilisateur avec l'email %s existe deja.", employerDTO.getEmail())
                );
            }

            employerDAO.save(
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

    @Transactional
    public String registerStudent(StudentDTO studentDTO) {
        try {
            validatePassword(studentDTO.getPassword());

            if (userAppDAO.findUserAppByEmail(studentDTO.getEmail()).isPresent()) {
                throw new UserAlreadyExistsException(
                        String.format("L'utilisateur avec l'email %s existe deja.", studentDTO.getEmail())
                );
            }

            studentDAO.save(
                    Student.builder()
                            .credentials(new Credentials(studentDTO.getEmail(),
                                    passwordEncoder.encode(studentDTO.getPassword()), Role.STUDENT))
                            .firstName(studentDTO.getFirstName())
                            .lastName(studentDTO.getLastName())
                            .build()
            );

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    studentDTO.getEmail(), studentDTO.getPassword()
            );
            return jwtTokenProvider.generateToken(
                    authentication
            );
        }
        catch (DataIntegrityViolationException e) {
            throw new RequiredFieldException("Il y a des champs manquants.");
        }
    }

    public void validatePassword(String password) {
        if (password.length() < 8) {
            throw new WeakPasswordException("Le mot de passe doit contenir au moins 8 caractères.");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new WeakPasswordException("Le mot de passe doit contenir au moins une lettre majuscule.");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new WeakPasswordException("Le mot de passe doit contenir au moins un chiffre.");
        }
        if (!password.matches(".*[!@#$%^&()_+\\-=\\[\\]{};':|,.<>/?].*")) {
            throw new WeakPasswordException("Le mot de passe doit contenir au moins un caractère spécial.");
        }
    }
}
