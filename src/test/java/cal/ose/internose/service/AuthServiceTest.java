package cal.ose.internose.service;


import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.persistance.UserAppDAO;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exception.RequiredFieldException;
import cal.ose.internose.service.exception.UserAlreadyExistsException;
import cal.ose.internose.service.exception.WeakPasswordException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private UserAppDAO userAppDAO;
    @Mock
    private EmployerDAO employerDAO;
    @Mock
    private StudentDAO studentDAO;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterEmployer() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "TestPassword1@", Role.EMPLOYER, "testEntreprise");

        when(employerDAO.save(any(Employer.class))).thenReturn(
                Employer.builder().firstName("testNom").lastName("testPrenom").build()
        );

        authService.registerEmployer(dto);

        verify(employerDAO).save(any(Employer.class));

    }

    @Test
    void testRegisterEmployerToken() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "TestPassword1@", Role.EMPLOYER, "testEntreprise");

        when(userAppDAO.findUserAppByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(employerDAO.save(any(Employer.class))).thenReturn(
                Employer.builder()
                        .firstName(dto.getFirstName())
                        .lastName(dto.getLastName())
                        .enterprise(dto.getEnterprise())
                        .credentials(new Credentials(dto.getEmail(), "encodedPassword", Role.EMPLOYER))
                        .build()
        );
        when(jwtTokenProvider.generateToken(any())).thenReturn("mocked-jwt-token");

        String token = authService.registerEmployer(dto);

        assertNotNull(token);
        assertEquals("mocked-jwt-token", token);
    }

    @Test
    void testEmployerPasswordTooShort() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "J4ck!", Role.EMPLOYER, "testEntreprise");

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerEmployer(dto));

        assertEquals("Le mot de passe doit contenir au moins 8 caractères.", exception.getMessage());
    }

    @Test
    void testEmployerPasswordMissingUppercaseLetter() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "jacques4@", Role.EMPLOYER, "testEntreprise");

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerEmployer(dto));

        assertEquals("Le mot de passe doit contenir au moins une lettre majuscule.", exception.getMessage());
    }

    @Test
    void testEmployerPasswordMissingNumber() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "Jacques-", Role.EMPLOYER, "testEntreprise");

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerEmployer(dto));

        assertEquals("Le mot de passe doit contenir au moins un chiffre.", exception.getMessage());
    }


    @Test
    void testEmployerMissingFields() {
        EmployerDTO dto = new EmployerDTO(null, "testPrenom", "testEmail", "TestPassword1@", Role.EMPLOYER, "testEntreprise");

        when(employerDAO.save(any(Employer.class))).thenThrow(new org.springframework.dao.DataIntegrityViolationException("Missing field"));

        RequiredFieldException exception = assertThrows(RequiredFieldException.class, () -> authService.registerEmployer(dto));

        assertEquals("Il y a des champs manquants.", exception.getMessage());
    }

    @Test
    void testEmployerEmailExists() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "TestPassword1@", Role.EMPLOYER, "testEntreprise");

        when(userAppDAO.findUserAppByEmail(anyString())).thenReturn(Optional.of(mock(UserApp.class)));
        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class, () -> authService.registerEmployer(dto));

        assertEquals("L'utilisateur avec l'email testEmail existe deja.", exception.getMessage());
    }

    @Test
    void testRegisterStudent() {
        StudentDTO dto = new StudentDTO("testNom", "testPrenom", "testEmail", "TestPassword1@", Role.STUDENT);

        when(studentDAO.save(any(Student.class))).thenReturn(
                Student.builder().firstName("testNom").lastName("testPrenom").build()
        );

        authService.registerStudent(dto);

        verify(studentDAO).save(any(Student.class));
    }

    @Test
    void testRegisterStudentToken() {
        StudentDTO dto = new StudentDTO("testNom", "testPrenom", "testEmail", "TestPassword1@", Role.STUDENT);

        when(userAppDAO.findUserAppByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(studentDAO.save(any(Student.class))).thenReturn(
                Student.builder()
                        .firstName(dto.getFirstName())
                        .lastName(dto.getLastName())
                        .credentials(new Credentials(dto.getEmail(), "encodedPassword", Role.STUDENT))
                        .build()
        );
        when(jwtTokenProvider.generateToken(any())).thenReturn("mocked-jwt-token");

        String token = authService.registerStudent(dto);

        assertNotNull(token);
        assertEquals("mocked-jwt-token", token);
    }

    @Test
    void testStudentPasswordTooShort() {
        StudentDTO dto = new StudentDTO("testNom", "testPrenom", "testEmail", "J4ck!", Role.STUDENT);

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerStudent(dto));

        assertEquals("Le mot de passe doit contenir au moins 8 caractères.", exception.getMessage());
    }

    @Test
    void testStudentPasswordMissingUppercaseLetter() {
        StudentDTO dto = new StudentDTO("testNom", "testPrenom", "testEmail", "jacques4@", Role.STUDENT);

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerStudent(dto));

        assertEquals("Le mot de passe doit contenir au moins une lettre majuscule.", exception.getMessage());
    }

    @Test
    void testStudentPasswordMissingNumber() {
        StudentDTO dto = new StudentDTO("testNom", "testPrenom", "testEmail", "Jacques-", Role.STUDENT);

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerStudent(dto));

        assertEquals("Le mot de passe doit contenir au moins un chiffre.", exception.getMessage());
    }

    @Test
    void testStudentMissingFields() {
        StudentDTO dto = new StudentDTO(null, "testPrenom", "testEmail", "TestPassword1@", Role.STUDENT);

        when(studentDAO.save(any(Student.class))).thenThrow(new org.springframework.dao.DataIntegrityViolationException("Missing field"));

        RequiredFieldException exception = assertThrows(RequiredFieldException.class, () -> authService.registerStudent(dto));

        assertEquals("Il y a des champs manquants.", exception.getMessage());
    }

    @Test
    void testStudentEmailExists() {
        StudentDTO dto = new StudentDTO("testNom", "testPrenom", "testEmail", "TestPassword1@", Role.STUDENT);

        when(userAppDAO.findUserAppByEmail(anyString())).thenReturn(Optional.of(mock(UserApp.class)));
        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class, () -> authService.registerStudent(dto));

        assertEquals("L'utilisateur avec l'email testEmail existe deja.", exception.getMessage());
    }
}