package cal.ose.internose.modele;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
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

    @Enumerated(EnumType.STRING)
    @Column(name = "resume_status")
    @Builder.Default
    private VerificationStatus resumeStatus = VerificationStatus.NONE;

    @Column(name = "resume_upload_date")
    private LocalDateTime resumeUploadDate;

    @Column(name = "resume_rejection_reason", length = 9000)
    private String resumeRejectionReason;

    @Column(name = "resume_verify_date")
    private LocalDateTime resumeVerifyDate;
}
