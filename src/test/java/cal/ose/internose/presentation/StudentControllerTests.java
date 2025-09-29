package cal.ose.internose.presentation;

import cal.ose.internose.modele.Student;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.StudentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;

@WebMvcTest(StudentController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("StudentController Tests")
public class StudentControllerTests {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudentService studentService;

    @Test
    @DisplayName("Test de la méthode uploadCV() (POST /api/student/cv)")
    public void testUploadCV() throws Exception {
        // Arrange
        Long studentID = 1L;
        Student student = exampleStudent();
        MockMultipartFile mockFile = new MockMultipartFile(
            "file", "CV_Exemple.pdf", "application/pdf", "Ceci est un fichier CV exemple".getBytes()
        );
        student.setCVFileName(mockFile.getOriginalFilename());
        student.setCVFileData(mockFile.getBytes());
        when(studentService.uploadCV(anyLong(), any(MultipartFile.class))).thenReturn(Optional.of(student));
        // Act
        MvcResult mvcResult = mockMvc.perform(
            multipart(Paths.STUDENT_CV_PATH)
            .file(mockFile)
            .param("studentID", String.valueOf(studentID))
            .contentType(MediaType.MULTIPART_FORM_DATA_VALUE)
        ).andReturn();
        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
    }

    private Student exampleStudent() {
        return Student.builder()
            .firstName("Artyom")
            .lastName("M.")
            .build();
    }
}
