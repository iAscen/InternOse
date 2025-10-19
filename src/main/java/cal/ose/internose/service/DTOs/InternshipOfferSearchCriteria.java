package cal.ose.internose.service.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InternshipOfferSearchCriteria {
    private String program;           // Discipline/Programme
    private String location;          // Lieu (adresse)
    private String jobTitle;         // Titre du poste
    private String company;          // Nom de l'entreprise
    private Double minSalary;        // Salaire minimum
    private Double maxSalary;        // Salaire maximum
    private Integer minDuration;     // Durée minimum (en semaines)
    private Integer maxDuration;     // Durée maximum (en semaines)
    private LocalDate startDateFrom; // Date de début minimum
    private LocalDate startDateTo;   // Date de début maximum
    private String sortBy;           // Critère de tri (jobTitle, company, startDate, salary, etc.)
    private String sortOrder;        // Ordre de tri (asc, desc)
    private Integer page;            // Numéro de page (pour pagination)
    private Integer size;            // Taille de page (pour pagination)
}
