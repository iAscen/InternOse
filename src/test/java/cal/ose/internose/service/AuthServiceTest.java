package cal.ose.internose.service;


import cal.ose.internose.modele.Credentials;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.Role;
import cal.ose.internose.modele.UserApp;
import cal.ose.internose.persistance.EmployerRepository;
import cal.ose.internose.persistance.UserAppRepository;
import cal.ose.internose.security.JwtTokenProvider;
import cal.ose.internose.service.DTOs.EmployerDTO;
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
    private UserAppRepository userAppRepository;
    @Mock
    private EmployerRepository employerRepository;
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

        when(employerRepository.save(any(Employer.class))).thenReturn(
                Employer.builder().firstName("testNom").lastName("testPrenom").build()
        );

        authService.registerEmployer(dto);

        verify(employerRepository).save(any(Employer.class));

    }

    @Test
    void testRegistreEmployerToken() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "TestPassword1@", Role.EMPLOYER, "testEntreprise");

        when(userAppRepository.findUserAppByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(employerRepository.save(any(Employer.class))).thenReturn(
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
    void testEmployerMotPasseChar() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "J4ck!", Role.EMPLOYER, "testEntreprise");

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerEmployer(dto));

        assertEquals("Le mot de passe doit contenir au moins 8 caractères.", exception.getMessage());
    }

    @Test
    void testEmployerMotPasseMaj() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "jacques4@", Role.EMPLOYER, "testEntreprise");

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerEmployer(dto));

        assertEquals("Le mot de passe doit contenir au moins une lettre majuscule.", exception.getMessage());
    }

    @Test
    void testEmployerMotPasseChiffre() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "Jacques-", Role.EMPLOYER, "testEntreprise");

        WeakPasswordException exception = assertThrows(WeakPasswordException.class, () -> authService.registerEmployer(dto));

        assertEquals("Le mot de passe doit contenir au moins un chiffre.", exception.getMessage());
    }


    @Test
    void testEmployerChampsManque() {
        EmployerDTO dto = new EmployerDTO(null, "testPrenom", "testEmail", "TestPassword1@", Role.EMPLOYER, "testEntreprise");

        when(employerRepository.save(any(Employer.class))).thenThrow(new org.springframework.dao.DataIntegrityViolationException("Missing field"));

        RequiredFieldException exception = assertThrows(RequiredFieldException.class, () -> authService.registerEmployer(dto));

        assertEquals("Il y a des champs manquants.", exception.getMessage());
    }

    @Test
    void testEmployerEmailExistant() {
        EmployerDTO dto = new EmployerDTO("testNom", "testPrenom", "testEmail", "TestPassword1@", Role.EMPLOYER, "testEntreprise");

        when(userAppRepository.findUserAppByEmail(anyString())).thenReturn(Optional.of(mock(UserApp.class)));
        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class, () -> authService.registerEmployer(dto));

        assertEquals("L'utilisateur avec l'email testEmail existe deja.", exception.getMessage());
    }
}