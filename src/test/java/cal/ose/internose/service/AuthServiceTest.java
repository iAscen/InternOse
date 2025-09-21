package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.UserAppDAO;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exception.ErrorMessages;
import cal.ose.internose.service.exception.RequiredFieldException;
import cal.ose.internose.service.exception.UserAlreadyExistsException;
import cal.ose.internose.service.exception.WeakPasswordException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.ArgumentMatchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private UserAppDAO userAppDAO;
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
        EmployerDTO dto = createEmployerDTO(null);

        when(userAppDAO.save(any(Employer.class))).thenReturn(
                Employer.builder().firstName("testNom").lastName("testPrenom").build()
        );

        authService.registerEmployer(dto);

        verify(userAppDAO).save(any(Employer.class));

    }

    @Test
    void testRegisterEmployerToken() {
        EmployerDTO dto = createEmployerDTO(null);

        when(userAppDAO.findUserAppByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userAppDAO.save(any(Employer.class))).thenReturn(
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

    @ParameterizedTest
    @MethodSource({"weakPasswordProvider"})
    void testEmployerPasswordTooWeak(String password, String errorMessage) {
        EmployerDTO employerDTO = createEmployerDTO(password);
        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerEmployer(employerDTO));
        assertEquals(errorMessage, exception.getMessage());
    }

    @Test
    void testEmployerMissingFields() {
        EmployerDTO dto = createEmployerDTO(null);
        dto.setFirstName(null);

        when(userAppDAO.save(any(Employer.class))).thenThrow(new org.springframework.dao.DataIntegrityViolationException("Missing field"));

        RequiredFieldException exception = assertThrows(RequiredFieldException.class, () -> authService.registerEmployer(dto));

        assertEquals(ErrorMessages.REQUIRED_FIELDS_MISSING.getMessage(), exception.getMessage());
    }

    @Test
    void testEmployerEmailExists() {
        EmployerDTO dto = createEmployerDTO(null);

        when(userAppDAO.findUserAppByEmail(anyString())).thenReturn(Optional.of(mock(UserApp.class)));
        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class, () -> authService.registerEmployer(dto));

        assertEquals(String.format(ErrorMessages.EMAIL_ALREADY_EXISTS.getMessage(), dto.getEmail()), exception.getMessage());
    }

    @Test
    void testRegisterStudent() {
        StudentDTO dto = createStudentDTO(null);

        when(userAppDAO.save(any(Student.class))).thenReturn(
                Student.builder().firstName("testNom").lastName("testPrenom").build()
        );

        authService.registerStudent(dto);

        verify(userAppDAO).save(any(Student.class));
    }

    @Test
    void testRegisterStudentToken() {
        StudentDTO dto = createStudentDTO(null);

        when(userAppDAO.findUserAppByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userAppDAO.save(any(Student.class))).thenReturn(
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

    @ParameterizedTest
    @MethodSource({"weakPasswordProvider"})
    void testStudentPasswordTooWeak(String password, String errorMessage) {
        StudentDTO studentDTO = createStudentDTO(password);
        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerStudent(studentDTO));
        assertEquals(errorMessage, exception.getMessage());
    }

    @Test
    void testStudentMissingFields() {
        StudentDTO dto = createStudentDTO(null);
        dto.setFirstName(null);

        when(userAppDAO.save(any(Student.class))).thenThrow(new org.springframework.dao.DataIntegrityViolationException("Missing field"));

        RequiredFieldException exception = assertThrows(RequiredFieldException.class, () -> authService.registerStudent(dto));

        assertEquals(ErrorMessages.REQUIRED_FIELDS_MISSING.getMessage(), exception.getMessage());
    }

    @Test
    void testStudentEmailExists() {
        StudentDTO dto = createStudentDTO(null);

        when(userAppDAO.findUserAppByEmail(anyString())).thenReturn(Optional.of(mock(UserApp.class)));
        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class, () -> authService.registerStudent(dto));

        assertEquals(String.format(ErrorMessages.EMAIL_ALREADY_EXISTS.getMessage(), dto.getEmail()), exception.getMessage());
    }

    private StudentDTO createStudentDTO(String password) {
        return StudentDTO.builder()
                .firstName("testNom")
                .lastName("testPrenom")
                .email("testEmail")
                .password(password == null ? "TestPassword1@" : password)
                .role(Role.STUDENT).build();
    }

    private EmployerDTO createEmployerDTO(String password) {
        return new EmployerDTO(
                "testNom",
                "testPrenom",
                "testEmail",
                password != null ? password : "TestPassword1@", // default password if none provided
                Role.EMPLOYER,
                "testEntreprise"
        );
    }

    private static Stream<Arguments> weakPasswordProvider() {
        return Stream.of(
                arguments("J4ck!", ErrorMessages.PASSWORD_TOO_SHORT.getMessage()),
                arguments("jacques4@", ErrorMessages.PASSWORD_MISSING_UPPER.getMessage()),
                arguments("Jacques-", ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage())
        );
    }
}