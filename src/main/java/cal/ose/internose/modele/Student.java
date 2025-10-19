package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "STUDENTS")
@DiscriminatorValue("S")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
public class Student extends User {
    private String resumeFileName;
    private String resumeFileType;
    @Column(columnDefinition = "BYTEA")
    private byte[] resumeFileData;

    @Column(name = "resume_upload_date")
    private LocalDateTime resumeUploadDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "resume_status")
    @Builder.Default
    private VerificationStatus resumeVerificationStatus = VerificationStatus.NONE;

    @Column(name = "resume_verified_date")
    private LocalDateTime resumeVerifiedDate;

    @Column(name = "resume_rejection_reason", length = 9000)
    private String resumeRejectionReason;
}
