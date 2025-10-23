package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.Interview;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class InterviewDTO {
    private Long id;
    private Long studentApplicationId;
    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private Long internshipOfferId;
    private String jobTitle;
    private LocalDateTime interviewDateTime;
    private String interviewMode;
    private String location;
    private String personalizedMessage;
    private String status;
    private LocalDateTime createdAt;

    public static InterviewDTO fromEntity(Interview interview) {
        return InterviewDTO.builder()
                .id(interview.getId())
                .studentApplicationId(interview.getStudentApplication().getId())
                .studentId(interview.getStudentApplication().getStudent().getId())
                .studentFirstName(interview.getStudentApplication().getStudent().getFirstName())
                .studentLastName(interview.getStudentApplication().getStudent().getLastName())
                .internshipOfferId(interview.getStudentApplication().getInternshipOffer().getId())
                .jobTitle(interview.getStudentApplication().getInternshipOffer().getTitle())
                .interviewDateTime(interview.getInterviewDateTime())
                .interviewMode(interview.getInterviewMode().name())
                .location(interview.getLocation())
                .personalizedMessage(interview.getPersonalizedMessage())
                .status(interview.getStatus().name())
                .createdAt(interview.getCreatedAt())
                .build();
    }

    public static List<InterviewDTO> fromEntityList(List<Interview> interviews) {
        return interviews.stream()
                .map(InterviewDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
