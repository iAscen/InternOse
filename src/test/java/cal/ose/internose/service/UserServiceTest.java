package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.UserDAO;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.LoginDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.ErrorMessages;
import cal.ose.internose.service.exceptions.RequiredFieldException;
import cal.ose.internose.service.exceptions.UserAlreadyExistsException;
import cal.ose.internose.service.exceptions.WeakPasswordException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.AfterEach;

import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class UserServiceTest {
    private static final String TEST_FIRST_NAME = "testPrenom";
    private static final String TEST_LAST_NAME = "testNom";
    private static final String TEST_COMPANY = "testEntreprise";
    private static final String TEST_EMAIL = "test@Email";
    private static final String TEST_PASSWORD = "TestPassword1@";

    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private UserDAO userDAO;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() {
        reset(jwtTokenProvider, userDAO, passwordEncoder, authenticationManager);
    }

    private void mockSuccessfulRegistration(User user) {
        when(userDAO.findByCredentials_Email(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userDAO.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateToken(any(), anyLong(), anyString(), anyString()))
            .thenReturn("mocked-jwt-token");
    }

    @Test
    void testRegisterEmployer() throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        EmployerDTO dto = createEmployerDTO(null);

        when(userDAO.save(any(Employer.class))).thenReturn(
            Employer.builder().firstName(TEST_FIRST_NAME).lastName(TEST_LAST_NAME).build());

        userService.registerEmployer(dto);

        verify(userDAO).save(any(Employer.class));

    }

    @Test
    void testRegisterEmployerToken() throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        EmployerDTO dto = createEmployerDTO(null);

        Employer mockEmployer = Employer.builder()
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .company(dto.getCompany())
            .credentials(new Credentials(dto.getEmail(), "encodedPassword", UserRole.EMPLOYER))
            .build();
        mockEmployer.setId(1L);

        mockSuccessfulRegistration(mockEmployer);

        String token = userService.registerEmployer(dto);

        assertNotNull(token);
        assertEquals("mocked-jwt-token", token);
    }

    @ParameterizedTest
    @MethodSource({"weakPasswordProvider"})
    void testEmployerPasswordTooWeak(String password, String errorMessage) {
        EmployerDTO employerDTO = createEmployerDTO(password);
        WeakPasswordException exception = assertThrows(
            WeakPasswordException.class,
            () -> userService.registerEmployer(employerDTO));
        assertEquals(errorMessage, exception.getMessage());

        verifyNoInteractions(userDAO, jwtTokenProvider, authenticationManager);
    }

    @Test
    void testEmployerMissingFields() {
        EmployerDTO dto = createEmployerDTO(null);
        dto.setFirstName(null);

        when(userDAO.save(any(Employer.class)))
            .thenThrow(new org.springframework.dao.DataIntegrityViolationException("Missing field"));

        RequiredFieldException exception = assertThrows(RequiredFieldException.class,
            () -> userService.registerEmployer(dto));

        assertEquals(ErrorMessages.REQUIRED_FIELDS_MISSING.getMessage(), exception.getMessage());
    }

    @Test
    void testEmployerEmailExists() {
        EmployerDTO dto = createEmployerDTO(null);

        when(userDAO.findByCredentials_Email(anyString())).thenReturn(Optional.of(mock(User.class)));
        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class,
            () -> userService.registerEmployer(dto));

        assertEquals(String.format(ErrorMessages.EMAIL_ALREADY_USED.getMessage(), dto.getEmail()),
            exception.getMessage());
    }

    @Test
    void testRegisterStudent() throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        StudentDTO dto = createStudentDTO(null);

        when(userDAO.save(any(Student.class))).thenReturn(
            Student.builder().firstName(TEST_FIRST_NAME).lastName(TEST_LAST_NAME).build());

        userService.registerStudent(dto);

        verify(userDAO).save(any(Student.class));
    }

    @Test
    void testRegisterStudentToken() throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        StudentDTO dto = createStudentDTO(null);

        Student mockStudent = Student.builder()
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .credentials(new Credentials(dto.getEmail(), "encodedPassword", UserRole.STUDENT))
            .build();
        mockStudent.setId(1L);
        mockSuccessfulRegistration(mockStudent);

        String token = userService.registerStudent(dto);

        assertNotNull(token);
        assertEquals("mocked-jwt-token", token);
    }

    @ParameterizedTest
    @MethodSource({"weakPasswordProvider"})
    void testStudentPasswordTooWeak(String password, String errorMessage) {
        StudentDTO studentDTO = createStudentDTO(password);
        WeakPasswordException exception = assertThrows(WeakPasswordException.class,
            () -> userService.registerStudent(studentDTO));
        assertEquals(errorMessage, exception.getMessage());
    }

    @Test
    void testStudentMissingFields() {
        StudentDTO dto = createStudentDTO(null);
        dto.setFirstName(null);

        when(userDAO.save(any(Student.class)))
            .thenThrow(new org.springframework.dao.DataIntegrityViolationException("Missing field"));

        RequiredFieldException exception = assertThrows(RequiredFieldException.class,
            () -> userService.registerStudent(dto));

        assertEquals(ErrorMessages.REQUIRED_FIELDS_MISSING.getMessage(), exception.getMessage());
    }

    @Test
    void testStudentEmailExists() {
        StudentDTO dto = createStudentDTO(null);

        when(userDAO.findByCredentials_Email(anyString())).thenReturn(Optional.of(mock(User.class)));
        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class,
            () -> userService.registerStudent(dto));

        assertEquals(String.format(ErrorMessages.EMAIL_ALREADY_USED.getMessage(), dto.getEmail()),
            exception.getMessage());
    }

    @Test
    void testLoginSuccess() {
        LoginDTO loginDTO = new LoginDTO("test@example.com", "Password123!");
        Authentication mockAuthentication = mock(Authentication.class);
        User mockUser = mock(User.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(mockAuthentication);
        when(userDAO.findByCredentials_Email(loginDTO.getEmail()))
            .thenReturn(Optional.of(mockUser));
        when(mockUser.getId()).thenReturn(1L);
        when(mockUser.getFirstName()).thenReturn(TEST_FIRST_NAME);
        when(mockUser.getLastName()).thenReturn(TEST_LAST_NAME);
        when(jwtTokenProvider.generateToken(
            eq(mockAuthentication), eq(1L), anyString(), anyString())).thenReturn("jwt-token");

        String token = userService.login(loginDTO);

        assertNotNull(token);
        assertEquals("jwt-token", token);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userDAO).findByCredentials_Email(loginDTO.getEmail());
        verify(jwtTokenProvider).generateToken(eq(mockAuthentication), anyLong(), anyString(), anyString());
    }

    @Test
    void testLoginWithInvalidCredentials() {
        LoginDTO loginDTO = new LoginDTO("test@example.com", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new org.springframework.security.core.AuthenticationException("Invalid credentials") {
            });

        assertThrows(org.springframework.security.core.AuthenticationException.class,
            () -> userService.login(loginDTO));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, never()).generateToken(any());
    }

    private StudentDTO createStudentDTO(String password) {
        return StudentDTO.builder()
            .firstName(TEST_FIRST_NAME)
            .lastName(TEST_LAST_NAME)
            .email(TEST_EMAIL)
            .password(password == null ? TEST_PASSWORD : password)
            .userRole(UserRole.STUDENT).build();
    }

    private EmployerDTO createEmployerDTO(String password) {
        return EmployerDTO.builder()
            .firstName(TEST_FIRST_NAME)
            .lastName(TEST_LAST_NAME)
            .email(TEST_EMAIL)
            .password(password != null ? password : TEST_PASSWORD)
            .userRole(UserRole.EMPLOYER)
            .company(TEST_COMPANY)
            .build();
    }

    private static Stream<Arguments> weakPasswordProvider() {
        return Stream.of(
            arguments("J4ck!", ErrorMessages.PASSWORD_TOO_SHORT.getMessage()),
            arguments("jacques4@", ErrorMessages.PASSWORD_MISSING_UPPER_CASE_LETTER.getMessage()),
            arguments("Jacques-", ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage()));
    }
}
