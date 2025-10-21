package cal.ose.internose.service.DTOs;

import lombok.*;

import java.time.LocalDate;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InternshipOfferSearchCriteria {
    private String title;
    private String company;
    private String program;
    private Integer minDuration;
    private Integer maxDuration;
    private LocalDate startDateFrom;
    private LocalDate startDateTo;
    private Double minSalary;
    private Double maxSalary;
    private String address;
    private String sortBy;
    private String sortOrder;
    private Integer page;
    private Integer size;
}
