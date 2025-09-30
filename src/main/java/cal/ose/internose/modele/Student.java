package cal.ose.internose.modele;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("S")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
public class Student extends UserApp {
    private String CVFileName;
    private String CVFileType;
    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] CVFileData;
}
