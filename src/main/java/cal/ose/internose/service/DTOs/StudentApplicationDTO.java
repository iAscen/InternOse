package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.StudentApplication;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public class StudentApplicationDTO {
    private String studentFirstName;
    private String studentLastName;
    private String internshipOfferTitle;
    private LocalDateTime applicationDate;
    private StudentApplication.ApplicationStatus applicationStatus;

    public static StudentApplicationDTO fromEntity(StudentApplication studentApplication) {
        return StudentApplicationDTO.builder()
            .studentFirstName(studentApplication.getStudent().getFirstName())
            .studentLastName(studentApplication.getStudent().getLastName())
            .internshipOfferTitle(studentApplication.getInternshipOffer().getTitle())
            .applicationDate(studentApplication.getApplicationDate())
            .applicationStatus(studentApplication.getApplicationStatus())
            .build();
    }

    public static List<StudentApplicationDTO> fromEntityList(List<StudentApplication> studentApplications) {
        return studentApplications.stream().map(StudentApplicationDTO::fromEntity).toList();
    }
}
