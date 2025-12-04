package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.LoginDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.UserService;
import cal.ose.internose.service.exceptions.ErrorMessages;
import cal.ose.internose.service.exceptions.WeakPasswordException;
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

import java.util.NoSuchElementException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
        assertThat(mvcResult.getResponse().getContentAsString()).isEqualTo("jwt");
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(mvcResult.getResponse().getContentAsString()).isEqualTo(ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage());
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
        assertThat(mvcResult.getResponse().getContentAsString()).isEqualTo("jwt");
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(mvcResult.getResponse().getContentAsString()).isEqualTo(ErrorMessages.PASSWORD_MISSING_NUMBER.getMessage());
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(mvcResult.getResponse().getContentAsString()).isEqualTo("jwt-token");
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(mvcResult.getResponse().getContentAsString()).isEqualTo("illegal");
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
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(mvcResult.getResponse().getContentAsString()).isEqualTo("Winter-2025");
    }

    private MvcResult performRequest(String path, String body) throws Exception {
        return mockMvc.perform(
            post(path)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
        ).andReturn();
    }
}
