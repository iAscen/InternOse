package cal.ose.internose.service;

import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.StudentDAO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StudentService Tests")
public class StudentServiceTests {
    @Mock
    private StudentDAO studentDAO;

    @InjectMocks
    private StudentService studentService;

    @Test
    @DisplayName("Test de la méthode uploadCV()")
    public void testUploadCV() throws IOException {
        // Arrange
        Long studentID = 1L;
        Student student = exampleStudent();
        MockMultipartFile mockFile = new MockMultipartFile(
            "file", "CV_Exemple.pdf", "application/pdf", "Ceci est un fichier CV exemple".getBytes()
        );
        student.setCVFileName(mockFile.getOriginalFilename());
        student.setCVFileType(mockFile.getContentType());
        student.setCVFileData(mockFile.getBytes());
        when(studentDAO.findById(studentID)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);
        // Act
        Optional<Student> studentWithCV = studentService.uploadCV(studentID, mockFile);
        // Assert
        assertThat(studentWithCV).isPresent();
        assertThat(studentWithCV.get().getCVFileName()).isEqualTo(mockFile.getOriginalFilename());
        assertThat(studentWithCV.get().getCVFileType()).isEqualTo(mockFile.getContentType());
        assertThat(studentWithCV.get().getCVFileData()).isEqualTo(mockFile.getBytes());
        verify(studentDAO, times(1)).save(any(Student.class));
    }

    private Student exampleStudent() {
        return Student.builder()
            .firstName("Artyom")
            .lastName("M.")
            .build();
    }
}
