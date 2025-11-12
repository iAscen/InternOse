package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.InternAssessment;
import cal.ose.internose.modele.InternAssessment.AssessmentOptions;
import cal.ose.internose.modele.InternAssessment.FutureCollaboration;
import cal.ose.internose.modele.InternAssessment.OverallInternAppreciation;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

/**
 * La classe DTO pour l'objet {@link InternAssessment}
 */
@Builder
@Getter
public class InternAssessmentDTO {
    private String studentName;
    private String studentProgram;
    private String companyName;
    private String supervisorName;
    private String supervisorTitle;
    private String supervisorPhoneNumber;

    private Map<String, AssessmentOptions> internAssessment;
    private Map<String, String> internAssessmentComments;

    private OverallInternAppreciation overallInternAppreciation;
    private String appreciationComment;
    private boolean discussedWithTheIntern;

    private double weeklySupervisionHours;

    private FutureCollaboration futureCollaboration;
    private String academicPreparationAdequacy;

    private String signerName;
    private String signerTitle;
    private String signature;
    private String signatureDate;

    public static InternAssessmentDTO fromEntity(InternAssessment internAssessment) {
        return InternAssessmentDTO.builder()
            .studentName(internAssessment.getStudentName())
            .studentProgram(internAssessment.getStudentProgram())
            .companyName(internAssessment.getCompanyName())
            .supervisorName(internAssessment.getSupervisorName())
            .supervisorTitle(internAssessment.getSupervisorTitle())
            .supervisorPhoneNumber(internAssessment.getSupervisorPhoneNumber())
            .internAssessment(internAssessment.getInternAssessment())
            .internAssessmentComments(internAssessment.getInternAssessmentComments())
            .overallInternAppreciation(internAssessment.getOverallInternAppreciation())
            .appreciationComment(internAssessment.getAppreciationComment())
            .discussedWithTheIntern(internAssessment.isDiscussedWithTheIntern())
            .weeklySupervisionHours(internAssessment.getWeeklySupervisionHours())
            .futureCollaboration(internAssessment.getFutureCollaboration())
            .academicPreparationAdequacy(internAssessment.getAcademicPreparationAdequacy())
            .signerName(internAssessment.getSignerName())
            .signerTitle(internAssessment.getSignerTitle())
            .signature(internAssessment.getSignature())
            .signatureDate(internAssessment.getSignatureDate())
            .build();
    }
}
