package cal.ose.internose.modele;

import cal.ose.internose.service.DTOs.InternAssessmentDTO;
import jakarta.persistence.*;
import lombok.*;

import java.util.Map;

/**
 * Fiche d'évaluation du stagiaire
 */
@Entity
@Table(name = "INTERN_ASSESSMENTS")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class InternAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    /**
     * Contient l'employeur, l'étudiant et l'offre de stage de cette évaluation du stagiaire
     */
    @OneToOne
    private InternshipContract internshipContract;

    private String studentName;
    private String studentProgram;
    private String companyName;
    private String supervisorName;
    private String supervisorTitle;
    private String supervisorPhoneNumber;

    /**
     * Les réponses possibles aux questions à choix multiples
     */
    public enum AssessmentOptions {
        COMPLETELY_AGREE,
        PARTIALLY_AGREE,
        PARTIALLY_DISAGREE,
        COMPLETELY_DISAGREE,
        NOT_APPLICABLE
    }
    /**
     * Ce dictionnaire contient les réponses aux questions à choix multiples
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "INTERN_ASSESSMENT_MAPS", joinColumns = @JoinColumn(name = "id"))
    @MapKeyColumn(name = "intern_assessment_key")
    @Column(name = "intern_assessment_value")
    @Enumerated(EnumType.STRING)
    private Map<String, AssessmentOptions> internAssessment;
    /**
     * Ce dictionnaire contient les commentaires à la fin de chaque section des questions à choix multiples
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "COMMENT_MAPS", joinColumns = @JoinColumn(name = "id"))
    @MapKeyColumn(name = "intern_assessment_comment_key")
    @Column(name = "intern_assessment_comment_value")
    @Enumerated(EnumType.STRING)
    private Map<String, String> internAssessmentComments;

    /**
     * Appréciation globale du stagiaire
     */
    public enum OverallInternAppreciation {
        GREATLY_EXCEEDS_EXPECTATIONS,
        EXCEEDS_EXPECTATIONS,
        FULLY_MEETS_EXPECTATIONS,
        PARTIALLY_MEETS_EXPECTATIONS,
        DOES_NOT_MEET_EXPECTATIONS
    }
    private OverallInternAppreciation overallInternAppreciation;
    /**
     * Précisez votre appreciation
     */
    private String appreciationComment;
    /**
     * Cette évaluation a été discutée avec le stagiaire?
     */
    private boolean discussedWithTheIntern;

    /**
     * Le nombre d'heures réel par semaine d'encadrement accordé au stagiaire
     */
    private double weeklySupervisionHours;

    /**
     * L'entreprise aimerait accueillir cet étudiant pour son prochain stage?
     */
    public enum FutureCollaboration { YES, MAYBE, NO }
    private FutureCollaboration futureCollaboration;
    /**
     * La formation technique du stagiaire était-elle suffisante pour accomplir le mandat de stage?
     */
    private String academicPreparationAdequacy;

    private String signerName;
    private String signerTitle;
    private String signature;
    private String signatureDate;

    public static InternAssessment fromDTO(InternAssessmentDTO internAssessmentDTO) {
        return InternAssessment.builder()
            .studentName(internAssessmentDTO.getStudentName())
            .studentProgram(internAssessmentDTO.getStudentProgram())
            .companyName(internAssessmentDTO.getCompanyName())
            .supervisorName(internAssessmentDTO.getSupervisorName())
            .supervisorTitle(internAssessmentDTO.getSupervisorTitle())
            .supervisorPhoneNumber(internAssessmentDTO.getSupervisorPhoneNumber())
            .internAssessment(internAssessmentDTO.getInternAssessment())
            .internAssessmentComments(internAssessmentDTO.getInternAssessmentComments())
            .overallInternAppreciation(internAssessmentDTO.getOverallInternAppreciation())
            .discussedWithTheIntern(internAssessmentDTO.isDiscussedWithTheIntern())
            .weeklySupervisionHours(internAssessmentDTO.getWeeklySupervisionHours())
            .futureCollaboration(internAssessmentDTO.getFutureCollaboration())
            .academicPreparationAdequacy(internAssessmentDTO.getAcademicPreparationAdequacy())
            .signerName(internAssessmentDTO.getSignerName())
            .signerTitle(internAssessmentDTO.getSignerTitle())
            .signature(internAssessmentDTO.getSignature())
            .signatureDate(internAssessmentDTO.getSignatureDate())
            .build();
    }
}
