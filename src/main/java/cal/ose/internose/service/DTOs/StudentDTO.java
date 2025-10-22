package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.modele.VerificationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@SuperBuilder
@NoArgsConstructor
@Getter
@Setter
public class StudentDTO extends UserDTO {
    private String institution;
    private String program;
    private String resumeFileName;
    private String resumeFileType;
    private byte[] resumeFileData;
    private LocalDateTime resumeUploadDate;
    @Builder.Default
    private VerificationStatus resumeVerificationStatus = VerificationStatus.NONE;
    private LocalDateTime resumeVerifiedDate;
    private String resumeRejectionReason;
    private LocalDateTime applicationDate;
    private StudentApplication.ApplicationStatus applicationStatus;

    public static StudentDTO fromEntity(Student student) {
        return StudentDTO.builder()
            .id(student.getId())
            .firstName(student.getFirstName())
            .lastName(student.getLastName())
            .email(student.getCredentials().getEmail())
            .password(student.getCredentials().getPassword())
            .userRole(student.getCredentials().getUserRole())
            .institution(student.getInstitution())
            .program(student.getProgram())
            .resumeFileName(student.getResumeFileName())
            .resumeFileType(student.getResumeFileType())
            .resumeFileData(student.getResumeFileData())
            .resumeUploadDate(student.getResumeUploadDate())
            .resumeVerificationStatus(student.getResumeVerificationStatus())
            .resumeVerifiedDate(student.getResumeVerifiedDate())
            .resumeRejectionReason(student.getResumeRejectionReason())
            .build();
    }

    public static List<StudentDTO> fromEntityList(List<Student> students) {
        return students.stream().map(StudentDTO::fromEntity).toList();
    }
}
