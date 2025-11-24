package cal.ose.internose.modele;

import cal.ose.internose.service.DTOs.SiteAssessmentDTO;
import jakarta.persistence.*;
import lombok.*;

import java.util.Map;

// évaluation du milieu de stage par le professeur

@Entity
@Table(name = "SITE_ASSESSMENTS")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class SiteAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne
    private InternshipContract internshipContract;

    private String studentName;
    private String companyName;
    private String supervisorName;
    private String internshipPosition;
    private String internshipDuration;

    public enum AssessmentOptions {
        EXCELLENT,
        VERY_GOOD,
        GOOD,
        SATISFACTORY,
        UNSATISFACTORY,
        NOT_APPLICABLE
    }

    @ElementCollection
    @CollectionTable(name = "SITE_ASSESSMENT_MAPS", joinColumns = @JoinColumn(name = "id"))
    @MapKeyColumn(name = "site_assessment_key")
    @Column(name = "site_assessment_value")
    @Enumerated(EnumType.STRING)
    private Map<String, AssessmentOptions> siteAssessment;

    @ElementCollection
    @CollectionTable(name = "SITE_COMMENT_MAPS", joinColumns = @JoinColumn(name = "id"))
    @MapKeyColumn(name = "site_assessment_comment_key")
    @Column(name = "site_assessment_comment_value", length = 1000)
    private Map<String, String> siteAssessmentComments;

    public enum OverallSiteAppreciation {
        EXCELLENT,
        VERY_GOOD,
        GOOD,
        SATISFACTORY,
        UNSATISFACTORY
    }
    private OverallSiteAppreciation overallSiteAppreciation;

    @Column(length = 2000)
    private String generalComments;

    public enum Recommendation {
        STRONGLY_RECOMMEND,
        RECOMMEND,
        RECOMMEND_WITH_RESERVATIONS,
        DO_NOT_RECOMMEND
    }
    private Recommendation recommendation;

    @Column(length = 1000)
    private String academicConformity;
    private String professorName;
    private String signature;
    private String assessmentDate;

    public static SiteAssessment fromDTO(SiteAssessmentDTO siteAssessmentDTO) {
        return SiteAssessment.builder()
            .studentName(siteAssessmentDTO.getStudentName())
            .companyName(siteAssessmentDTO.getCompanyName())
            .supervisorName(siteAssessmentDTO.getSupervisorName())
            .internshipPosition(siteAssessmentDTO.getInternshipPosition())
            .internshipDuration(siteAssessmentDTO.getInternshipDuration())
            .siteAssessment(siteAssessmentDTO.getSiteAssessment())
            .siteAssessmentComments(siteAssessmentDTO.getSiteAssessmentComments())
            .overallSiteAppreciation(siteAssessmentDTO.getOverallSiteAppreciation())
            .generalComments(siteAssessmentDTO.getGeneralComments())
            .recommendation(siteAssessmentDTO.getRecommendation())
            .academicConformity(siteAssessmentDTO.getAcademicConformity())
            .professorName(siteAssessmentDTO.getProfessorName())
            .signature(siteAssessmentDTO.getSignature())
            .assessmentDate(siteAssessmentDTO.getAssessmentDate())
            .build();
    }
}

