package cal.ose.internose.modele;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@DiscriminatorValue("S")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
public class Student extends UserApp {
    private String program;
    private String institution;
    private String CVFileName;
    private String CVFileType;
    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] CVFileData;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "cv_status")
    @Builder.Default
    private DocumentStatus cvStatus = DocumentStatus.NONE;
    
    @Column(name = "cv_uploaded_at")
    private LocalDateTime cvUploadedAt;
    
    @Column(name = "cv_rejection_reason", length = 1000)
    private String cvRejectionReason;
    
    @Column(name = "cv_validated_at")
    private LocalDateTime cvValidatedAt;

    @ManyToMany(mappedBy = "students") // if InternshipOffer owns the relationship
    private List<InternshipOffer> internshipOffers;
}
