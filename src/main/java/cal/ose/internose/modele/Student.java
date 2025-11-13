package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "STUDENTS")
@DiscriminatorValue("S")
@NoArgsConstructor
@SuperBuilder
@Getter
@Setter
public class Student extends User {
    private String institution;
    private String program;
    private String resumeFileName;
    private String resumeFileType;
    @Column(columnDefinition = "BYTEA")
    private byte[] resumeFileData;
    private LocalDateTime resumeUploadDate;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus resumeVerificationStatus = VerificationStatus.NONE;
    private LocalDateTime resumeVerifiedDate;
    private String resumeRejectionReason;
    @ManyToOne
    private Professor assignedProfessor;
}
