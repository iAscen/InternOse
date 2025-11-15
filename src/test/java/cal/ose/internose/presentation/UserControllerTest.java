package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.LoginDTO;
import cal.ose.internose.service.DTOs.NotificationDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.UserService;
import cal.ose.internose.service.exceptions.ErrorMessages;
import cal.ose.internose.service.exceptions.WeakPasswordException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.NoSuchElementException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @Test
    void testRegisterEmployerSuccess() throws Exception {
        // Arrange
        EmployerDTO employerDTO = EmployerDTO.builder().build();
        when(userService.registerEmployer(any(EmployerDTO.class))).thenReturn("jwt");
        String requestJson = objectMapper.writeValueAsString(employerDTO);

        // Act
        MvcResult mvcResult = performRequest(Paths.EMPLOYER_REGISTER_PATH, requestJson);

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.CREATED,
            null,
            "jwt"
        );
    }

    @Test
    void testRegisterEmployerFail() throws Exception {
        // Arrange
        EmployerDTO employerDTO = EmployerDTO.builder().build();
        when(userService.registerEmployer(any())).thenThrow(
            new WeakPasswordException(ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage())
        );
        String requestJson = objectMapper.writeValueAsString(employerDTO);

        // Act
        MvcResult mvcResult = performRequest(Paths.EMPLOYER_REGISTER_PATH, requestJson);

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.BAD_REQUEST,
            ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage(),
            null
        );
    }

    @Test
    void testRegisterStudentSuccess() throws Exception {
        // Arrange
        StudentDTO studentDTO = StudentDTO.builder().build();
        when(userService.registerStudent(any())).thenReturn("jwt");
        String requestJson = objectMapper.writeValueAsString(studentDTO);

        // Act
        MvcResult mvcResult = performRequest(Paths.STUDENT_REGISTER_PATH, requestJson);

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.CREATED,
            null,
            "jwt"
        );
    }

    @Test
    void testRegisterStudentFail() throws Exception {
        // Arrange
        StudentDTO studentDTO = StudentDTO.builder().build();
        when(userService.registerStudent(any())).thenThrow(
            new WeakPasswordException(ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage())
        );
        String requestBody = objectMapper.writeValueAsString(studentDTO);

        // Act
        MvcResult mvcResult = performRequest(Paths.STUDENT_REGISTER_PATH, requestBody);

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.BAD_REQUEST,
            ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage(),
            null
        );
    }

    @Test
    void testLoginSuccess() throws Exception {
        // Arrange
        LoginDTO loginDTO = new LoginDTO("test@example.com", "Password123!");
        when(userService.login(any())).thenReturn("jwt-token");
        String requestBody = objectMapper.writeValueAsString(loginDTO);

        // Act
        MvcResult mvcResult = performRequest(Paths.LOGIN_PATH, requestBody);

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.OK,
            null,
            "jwt-token"
        );
    }

    @Test
    void testLoginFail() throws Exception {
        // Arrange
        LoginDTO loginDTO = new LoginDTO("test@example.com", "WrongPassword");
        when(userService.login(any())).thenThrow(new RuntimeException("Incorrect username or password"));
        String requestBody = objectMapper.writeValueAsString(loginDTO);

        // Act
        MvcResult mvcResult = performRequest(Paths.LOGIN_PATH, requestBody);

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.FORBIDDEN,
            "Incorrect username or password",
            null
        );
    }

    @Test
    void findNotifications_Ok() throws Exception {
        // Arrange
        long userId = 1L;
        NotificationDTO notifDTO = NotificationDTO.builder()
            .id(100L)
            .message("Hello")
            .checked(false)
            .build();
        List<NotificationDTO> notifications = List.of(notifDTO);

        when(userService.findNotifications(userId)).thenReturn(notifications);

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.USER_NOTIFICATIONS_PATH.replace("{userID}", String.valueOf(userId)))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        String json = mvcResult.getResponse().getContentAsString();
        List<NotificationDTO> result = objectMapper.readValue(
            json, new TypeReference<List<NotificationDTO>>() {}
        );
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(result.size()).isEqualTo(1);
        assertThat(result.getFirst().getMessage()).isEqualTo("Hello");
    }

    @Test
    void findNotifications_NotFound() throws Exception {
        // Arrange
        long userId = 1L;
        when(userService.findNotifications(userId)).thenThrow(new NoSuchElementException("Utilisateur non trouvé"));

        // Act
        MvcResult mvcResult = mockMvc.perform(
                get(Paths.USER_NOTIFICATIONS_PATH.replace("{userID}", String.valueOf(userId)))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(mvcResult.getResponse().getContentAsString())
            .contains("Utilisateur non trouvé");
    }

    @Test
    @DisplayName("test setSession() - NoSuchElementException")
    void testSetSessionNoSuchElementException() throws Exception {
        // Arrange
        doThrow(new NoSuchElementException("not found")).when(userService).setSession(anyLong(), anyString());

        // Act
        MvcResult mvcResult = mockMvc.perform(
            put(Paths.SET_SESSION_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\": 123, \"session\": \"Winter-2025\"}") // id = long, session = string
        ).andReturn();

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.NOT_FOUND,
            "not found",
            null
        );
    }

    @Test
    @DisplayName("test setSession() - IllegalArgumentException")
    void testSetSessionIllegalArgumentException() throws Exception {
        // Arrange
        doThrow(new IllegalArgumentException("illegal")).when(userService).setSession(anyLong(), anyString());

        // Act
        MvcResult mvcResult = mockMvc.perform(
            put(Paths.SET_SESSION_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\": 123, \"session\": \"Winter-2025\"}") // id = long, session = string
        ).andReturn();

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.BAD_REQUEST,
            "illegal",
            null
        );
    }

    @Test
    @DisplayName("test setSession() - Success")
    void testSetSessionSuccess() throws Exception {
        // Arrange
        doNothing().when(userService).setSession(anyLong(), anyString());

        // Act
        MvcResult mvcResult = mockMvc.perform(
            put(Paths.SET_SESSION_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\": 123, \"session\": \"Winter-2025\"}") // id = long, session = string
        ).andReturn();

        // Assert
        assertMvcResult(
            mvcResult,
            HttpStatus.OK,
            null,
            "Winter-2025"
        );
    }

    private MvcResult performRequest(String path, String body) throws Exception {
        return mockMvc.perform(
            post(path)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
        ).andReturn();
    }



    private void assertMvcResult(
        MvcResult mvcResult,
        HttpStatus expectedHttpStatus,
        String expectedErrorMessage,
        String expectedSuccessMessage
    ) throws Exception {
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(expectedHttpStatus.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).isNotNull();

//        if (expectedSuccessMessage == null) {
//            ErrorResponseDTO errorResponse = objectMapper.readValue(responseContent, ErrorResponseDTO.class);
//            assertThat(errorResponse.getMessage()).isEqualTo(expectedErrorMessage);
//        } else {
//            String jwt = mvcResult.getResponse().getContentAsString();
//            assertThat(jwt).isEqualTo(expectedSuccessMessage);
//        }
    }
}
