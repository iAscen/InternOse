package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.StudentApplication;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentApplicationDTO {
    private String studentFirstName;
    private String studentLastName;
    private String internshipOfferTitle;
    private Long internshipOfferId;
    private LocalDateTime applicationDate;
    private StudentApplication.ApplicationStatus applicationStatus;

    public static StudentApplicationDTO fromEntity(StudentApplication studentApplication) {
        return StudentApplicationDTO.builder()
            .studentFirstName(studentApplication.getStudent().getFirstName())
            .studentLastName(studentApplication.getStudent().getLastName())
            .internshipOfferTitle(studentApplication.getInternshipOffer().getTitle())
            .internshipOfferId(studentApplication.getInternshipOffer().getId())
            .applicationDate(studentApplication.getApplicationDate())
            .applicationStatus(studentApplication.getApplicationStatus())
            .build();
    }

    public static List<StudentApplicationDTO> fromEntityList(List<StudentApplication> studentApplications) {
        return studentApplications.stream().map(StudentApplicationDTO::fromEntity).toList();
    }
}
