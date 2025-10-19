package cal.ose.internose.presentation;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.modele.Student;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.StudentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;

@ExtendWith(MockitoExtension.class)
@DisplayName("StudentController Tests")
public class StudentControllerTests {
    @Mock
    private StudentService studentService;

    @InjectMocks
    private StudentController studentController;

    private MockMvc mockMvc;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(studentController).build();
    }

    @Test
    @DisplayName("Test de la méthode uploadCV() (POST /api/student/cv)")
    public void testUploadCV() throws Exception {
        // Arrange
        Long studentID = 1L;
        Student student = exampleStudent();
        MockMultipartFile mockFile = new MockMultipartFile(
            "file", "CV_Exemple.pdf", "application/pdf", "Ceci est un fichier CV exemple".getBytes()
        );
        student.setResumeFileName(mockFile.getOriginalFilename());
        student.setResumeFileData(mockFile.getBytes());
        when(studentService.uploadResume(anyLong(), any(MultipartFile.class))).thenReturn(Optional.of(student));
        // Act
        MvcResult mvcResult = mockMvc.perform(
            multipart(Paths.STUDENT_RESUME_PATH)
            .file(mockFile)
            .param("studentID", String.valueOf(studentID))
            .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
        ).andReturn();
        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
    }

    @Test
    @DisplayName("Test de la méthode getCVStatus() (GET /api/student/cv/status)")
    public void testGetCVStatus() throws Exception {
        // Arrange
        Long studentID = 1L;
        Student student = exampleStudent();
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        student.setResumeFileName("test.pdf");
        student.setResumeUploadDate(LocalDateTime.now());
        when(studentService.getStudentByID(studentID)).thenReturn(Optional.of(student));

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get("/api/student/cv/status")
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        String responseContent = mvcResult.getResponse().getContentAsString();
        assertThat(responseContent).contains("pending");
        assertThat(responseContent).contains("test.pdf");
    }

    @Test
    @DisplayName("Test de la méthode getCVStatus() avec étudiant non trouvé")
    public void testGetCVStatus_StudentNotFound() throws Exception {
        // Arrange
        Long studentID = 999L;
        when(studentService.getStudentByID(studentID)).thenReturn(Optional.empty());

        // Act
        MvcResult mvcResult = mockMvc.perform(
            get("/api/student/cv/status")
                .param("studentID", String.valueOf(studentID))
                .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
    }

    private Student exampleStudent() {
        return Student.builder()
            .firstName("Artyom")
            .lastName("M.")
            .build();
    }
}
