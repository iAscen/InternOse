package cal.ose.internose.service.DTOs;

import cal.ose.internose.modele.SiteAssessment;
import cal.ose.internose.modele.SiteAssessment.AssessmentOptions;
import cal.ose.internose.modele.SiteAssessment.OverallSiteAppreciation;
import cal.ose.internose.modele.SiteAssessment.Recommendation;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Builder
@Getter
public class SiteAssessmentDTO {
    private String studentName;
    private String companyName;
    private String supervisorName;
    private String internshipPosition;
    private String internshipDuration;

    private Map<String, AssessmentOptions> siteAssessment;
    private Map<String, String> siteAssessmentComments;

    private OverallSiteAppreciation overallSiteAppreciation;
    private String generalComments;

    private Recommendation recommendation;
    private String academicConformity;

    private String professorName;
    private String signature;
    private String assessmentDate;

    public static SiteAssessmentDTO fromEntity(SiteAssessment siteAssessment) {
        return SiteAssessmentDTO.builder()
            .studentName(siteAssessment.getStudentName())
            .companyName(siteAssessment.getCompanyName())
            .supervisorName(siteAssessment.getSupervisorName())
            .internshipPosition(siteAssessment.getInternshipPosition())
            .internshipDuration(siteAssessment.getInternshipDuration())
            .siteAssessment(siteAssessment.getSiteAssessment())
            .siteAssessmentComments(siteAssessment.getSiteAssessmentComments())
            .overallSiteAppreciation(siteAssessment.getOverallSiteAppreciation())
            .generalComments(siteAssessment.getGeneralComments())
            .recommendation(siteAssessment.getRecommendation())
            .academicConformity(siteAssessment.getAcademicConformity())
            .professorName(siteAssessment.getProfessorName())
            .signature(siteAssessment.getSignature())
            .assessmentDate(siteAssessment.getAssessmentDate())
            .build();
    }
}

