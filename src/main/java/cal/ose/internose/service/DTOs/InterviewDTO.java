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
    private Long studentApplicationID;
    private Long internshipOfferID;
    private Long studentID;
    private String studentFirstName;
    private String studentLastName;
    private String title;
    private LocalDateTime interviewDate;
    private Interview.InterviewMode interviewMode;
    private String location;
    private String personalizedMessage;
    private LocalDateTime scheduleDate;
    private Interview.InterviewStatus interviewStatus;

    public static InterviewDTO fromEntity(Interview interview) {
        return InterviewDTO.builder()
            .id(interview.getId())
            .studentApplicationID(interview.getStudentApplication().getId())
            .internshipOfferID(interview.getStudentApplication().getInternshipOffer().getId())
            .studentID(interview.getStudentApplication().getStudent().getId())
            .studentFirstName(interview.getStudentApplication().getStudent().getFirstName())
            .studentLastName(interview.getStudentApplication().getStudent().getLastName())
            .title(interview.getStudentApplication().getInternshipOffer().getTitle())
            .interviewDate(interview.getInterviewDate())
            .interviewMode(interview.getInterviewMode())
            .location(interview.getLocation())
            .personalizedMessage(interview.getPersonalizedMessage())
            .interviewStatus(interview.getInterviewStatus())
            .scheduleDate(interview.getScheduleDate())
            .build();
    }

    public static List<InterviewDTO> fromEntityList(List<Interview> interviews) {
        return interviews.stream()
            .map(InterviewDTO::fromEntity)
            .collect(Collectors.toList());
    }
}
