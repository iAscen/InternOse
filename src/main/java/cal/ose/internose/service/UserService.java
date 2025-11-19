package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.NotificationDAO;
import cal.ose.internose.persistance.UserDAO;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.service.DTOs.*;
import cal.ose.internose.service.exceptions.ErrorMessages;
import cal.ose.internose.service.exceptions.RequiredFieldException;
import cal.ose.internose.service.exceptions.UserAlreadyExistsException;
import cal.ose.internose.service.exceptions.WeakPasswordException;
import cal.ose.internose.utilities.SessionUtil;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class UserService {
    private final UserDAO userDAO;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final NotificationDAO notificationDAO;

    public void registerInternshipManager(InternshipManagerDTO internshipManagerDTO)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        InternshipManager internshipManager = InternshipManager.builder()
            .credentials(
                new Credentials(internshipManagerDTO.getEmail(), passwordEncoder.encode(internshipManagerDTO.getPassword()), UserRole.INTERNSHIP_MANAGER)
            )
            .firstName(internshipManagerDTO.getFirstName())
            .lastName(internshipManagerDTO.getLastName())
            .build();

        registerUser(internshipManagerDTO.getEmail(), internshipManagerDTO.getPassword(), internshipManager);
    }

    public void registerProfessor(ProfessorDTO professorDTO)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        Professor professor = Professor.builder()
            .credentials(
                new Credentials(professorDTO.getEmail(), passwordEncoder.encode(professorDTO.getPassword()), UserRole.PROFESSOR)
            )
            .firstName(professorDTO.getFirstName())
            .lastName(professorDTO.getLastName())
            .build();

        registerUser(professorDTO.getEmail(), professorDTO.getPassword(), professor);
    }

    public String registerStudent(StudentDTO studentDTO)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        Student student = Student.builder()
            .credentials(
                new Credentials(studentDTO.getEmail(), passwordEncoder.encode(studentDTO.getPassword()), UserRole.STUDENT)
            )
            .firstName(studentDTO.getFirstName())
            .lastName(studentDTO.getLastName())
            .institution(studentDTO.getInstitution())
            .program(studentDTO.getProgram())
            .build();

        return registerUser(studentDTO.getEmail(), studentDTO.getPassword(), student);
    }

    public String registerEmployer(EmployerDTO employerDTO)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        Employer employer = Employer.builder()
            .credentials(
                new Credentials(employerDTO.getEmail(), passwordEncoder.encode(employerDTO.getPassword()), UserRole.EMPLOYER)
            )
            .firstName(employerDTO.getFirstName())
            .lastName(employerDTO.getLastName())
            .company(employerDTO.getCompany())
            .build();

        return registerUser(employerDTO.getEmail(), employerDTO.getPassword(), employer);
    }

    public String login(LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginDTO.getEmail(),
                loginDTO.getPassword()
            )
        );

        User user = userDAO.findByCredentials_Email(loginDTO.getEmail()).orElseThrow();

        String currentSession = SessionUtil.getCurrentSession();
        if (user.getSession() == null || !user.getSession().equals(currentSession)) {
            user.setSession(currentSession);
            userDAO.save(user);
        }

        return jwtTokenProvider.generateToken(
            authentication, user.getId(), user.getFirstName(), user.getLastName(), user.getSession()
        );
    }

    public List<NotificationDTO> findNotifications(long userId) {
        User user = userDAO.findById(userId).orElseThrow();
        return notificationDAO.findByUserAndCheckedOrderByCreatedAt(user, false).stream().map(
            notification -> NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .createdAt(notification.getCreatedAt())
                .message(notification.getMessage())
                .checked(notification.isChecked())
                .build()
        ).toList();
    }

    public void checkNotification(long notificationId) {
        Notification notification = notificationDAO.findById(notificationId).orElseThrow();
        notification.setChecked(true);
        notificationDAO.save(notification);
    }

    private String registerUser(String email, String password, User user)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        try {
            verifyPasswordCriteria(password);

            if (userDAO.findByCredentials_Email(email).isPresent()) {
                throw new UserAlreadyExistsException(
                    String.format(ErrorMessages.EMAIL_ALREADY_USED.getMessage(), email)
                );
            }

            user.setSession(SessionUtil.getCurrentSession());
            User savedUser = userDAO.save(user);

            Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);

            return jwtTokenProvider.generateToken(
                authentication, savedUser.getId(), savedUser.getFirstName(), savedUser.getLastName(), user.getSession()
            );
        } catch (DataIntegrityViolationException e) {
            throw new RequiredFieldException(ErrorMessages.REQUIRED_FIELDS_MISSING.getMessage());
        }
    }

    public void setSession(long userId, String session) {
        User user = userDAO.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("Utilisateur avec l'id " + userId + " introuvable"));

        if (session == null || !session.matches("(Winter-\\d+|Autumn-\\d+)")) {
            throw new IllegalArgumentException("La session doit être de la forme : Winter-2025 ou Autumn-2025");
        }

        user.setSession(session);
        userDAO.save(user);
    }

    public void verifyPasswordCriteria(String password) throws WeakPasswordException {
        if (password.length() < 8) {
            throw new WeakPasswordException(ErrorMessages.PASSWORD_TOO_SHORT.getMessage());
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new WeakPasswordException(ErrorMessages.PASSWORD_MISSING_UPPER_CASE_LETTER.getMessage());
        }
        if (!password.matches(".*[0-9].*")) {
            throw new WeakPasswordException(ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage());
        }
        if (!password.matches(".*[!@#$%^&()_+\\-=\\[\\]{};':|,.<>/?].*")) {
            throw new WeakPasswordException(ErrorMessages.PASSWORD_MISSING_SPECIAL_CHARACTER.getMessage());
        }
    }
}
