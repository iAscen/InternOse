package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InternshipOfferSearchCriteria;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InternshipOfferService Tests")
public class InternshipOfferServiceTest {

    @Mock
    private InternshipOfferDAO internshipOfferDAO;

    @InjectMocks
    private InternshipOfferService internshipOfferService;

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec critères de base")
    public void testSearchInternshipOffers_WithBasicCriteria() {
        // Arrange
        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                .program("Informatique")
                .location("Montréal")
                .sortBy("startDate")
                .sortOrder("asc")
                .page(0)
                .size(10)
                .build();

        List<InternshipOffer> mockOffers = createTestOffers();
        Page<InternshipOffer> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 10), 2);
        
        when(internshipOfferDAO.findInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                eq("Informatique"),
                eq("Montréal"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(mockPage);

        // Act
        Page<InternshipOfferDTO> result = internshipOfferService.searchInternshipOffers(criteria);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent().size()).isEqualTo(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        verify(internshipOfferDAO, times(1)).findInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                eq("Informatique"),
                eq("Montréal"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        );
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec critères de salaire")
    public void testSearchInternshipOffers_WithSalaryCriteria() {
        // Arrange
        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                .minSalary(500.0)
                .maxSalary(1000.0)
                .sortBy("salary")
                .sortOrder("desc")
                .page(0)
                .size(5)
                .build();

        List<InternshipOffer> mockOffers = createTestOffers();
        Page<InternshipOffer> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 5), 2);
        
        when(internshipOfferDAO.findInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(500.0),
                eq(1000.0),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(mockPage);

        // Act
        Page<InternshipOfferDTO> result = internshipOfferService.searchInternshipOffers(criteria);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent().size()).isEqualTo(2);
        verify(internshipOfferDAO, times(1)).findInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(500.0),
                eq(1000.0),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        );
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec critères de date")
    public void testSearchInternshipOffers_WithDateCriteria() {
        // Arrange
        LocalDate startDateFrom = LocalDate.of(2024, 6, 1);
        LocalDate startDateTo = LocalDate.of(2024, 8, 31);
        
        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                .startDateFrom(startDateFrom)
                .startDateTo(startDateTo)
                .sortBy("startDate")
                .sortOrder("asc")
                .page(0)
                .size(10)
                .build();

        List<InternshipOffer> mockOffers = createTestOffers();
        Page<InternshipOffer> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 10), 2);
        
        when(internshipOfferDAO.findInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(startDateFrom),
                eq(startDateTo),
                any(Pageable.class)
        )).thenReturn(mockPage);

        // Act
        Page<InternshipOfferDTO> result = internshipOfferService.searchInternshipOffers(criteria);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent().size()).isEqualTo(2);
        verify(internshipOfferDAO, times(1)).findInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(startDateFrom),
                eq(startDateTo),
                any(Pageable.class)
        );
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferById() avec offre trouvée")
    public void testGetInternshipOfferById_OfferFound() {
        // Arrange
        Long offerId = 1L;
        InternshipOffer mockOffer = createTestOffer();
        when(internshipOfferDAO.findByIdAndStatus(offerId, DocumentStatus.APPROVED))
                .thenReturn(mockOffer);

        // Act
        Optional<InternshipOfferDTO> result = internshipOfferService.getInternshipOfferById(offerId);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(offerId);
        assertThat(result.get().getJobTitle()).isEqualTo("Développeur Java");
        verify(internshipOfferDAO, times(1)).findByIdAndStatus(offerId, DocumentStatus.APPROVED);
    }

    @Test
    @DisplayName("Test de la méthode getInternshipOfferById() avec offre non trouvée")
    public void testGetInternshipOfferById_OfferNotFound() {
        // Arrange
        Long offerId = 999L;
        when(internshipOfferDAO.findByIdAndStatus(offerId, DocumentStatus.APPROVED))
                .thenReturn(null);

        // Act
        Optional<InternshipOfferDTO> result = internshipOfferService.getInternshipOfferById(offerId);

        // Assert
        assertThat(result).isEmpty();
        verify(internshipOfferDAO, times(1)).findByIdAndStatus(offerId, DocumentStatus.APPROVED);
    }

    @Test
    @DisplayName("Test de la méthode getAllApprovedInternshipOffers()")
    public void testGetAllApprovedInternshipOffers() {
        // Arrange
        List<InternshipOffer> mockOffers = createTestOffers();
        when(internshipOfferDAO.findAll()).thenReturn(mockOffers);

        // Act
        List<InternshipOfferDTO> result = internshipOfferService.getAllApprovedInternshipOffers();

        // Assert
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getJobTitle()).isEqualTo("Développeur Java");
        assertThat(result.get(1).getJobTitle()).isEqualTo("Analyste de données");
        verify(internshipOfferDAO, times(1)).findAll();
    }

    @Test
    @DisplayName("Test de la méthode countInternshipOffers()")
    public void testCountInternshipOffers() {
        // Arrange
        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                .program("Informatique")
                .build();

        when(internshipOfferDAO.countInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                eq("Informatique"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull()
        )).thenReturn(5L);

        // Act
        long result = internshipOfferService.countInternshipOffers(criteria);

        // Assert
        assertThat(result).isEqualTo(5L);
        verify(internshipOfferDAO, times(1)).countInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                eq("Informatique"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull()
        );
    }

    @Test
    @DisplayName("Test de la méthode searchInternshipOffers() avec tri par défaut")
    public void testSearchInternshipOffers_DefaultSort() {
        // Arrange
        InternshipOfferSearchCriteria criteria = InternshipOfferSearchCriteria.builder()
                .page(0)
                .size(10)
                .build();

        List<InternshipOffer> mockOffers = createTestOffers();
        Page<InternshipOffer> mockPage = new PageImpl<>(mockOffers, PageRequest.of(0, 10), 2);
        
        when(internshipOfferDAO.findInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(mockPage);

        // Act
        Page<InternshipOfferDTO> result = internshipOfferService.searchInternshipOffers(criteria);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent().size()).isEqualTo(2);
        verify(internshipOfferDAO, times(1)).findInternshipOffersWithFilters(
                eq(DocumentStatus.APPROVED),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        );
    }

    private List<InternshipOffer> createTestOffers() {
        Employer employer1 = Employer.builder()
                .enterprise("TechCorp")
                .build();
        employer1.setId(1L);

        Employer employer2 = Employer.builder()
                .enterprise("DataSoft")
                .build();
        employer2.setId(2L);

        InternshipOffer offer1 = InternshipOffer.builder()
                .id(1L)
                .employer(employer1)
                .jobTitle("Développeur Java")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(750.0)
                .duration(12)
                .startDate(LocalDate.of(2024, 6, 1))
                .validationStatus(DocumentStatus.APPROVED)
                .build();

        InternshipOffer offer2 = InternshipOffer.builder()
                .id(2L)
                .employer(employer2)
                .jobTitle("Analyste de données")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(650.0)
                .duration(16)
                .startDate(LocalDate.of(2024, 7, 1))
                .validationStatus(DocumentStatus.APPROVED)
                .build();

        return List.of(offer1, offer2);
    }

    private InternshipOffer createTestOffer() {
        Employer employer = Employer.builder()
                .enterprise("TechCorp")
                .build();
        employer.setId(1L);

        return InternshipOffer.builder()
                .id(1L)
                .employer(employer)
                .jobTitle("Développeur Java")
                .program("Informatique")
                .address("Montréal, QC")
                .salary(750.0)
                .duration(12)
                .startDate(LocalDate.of(2024, 6, 1))
                .validationStatus(DocumentStatus.APPROVED)
                .build();
    }
}
