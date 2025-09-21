package cal.ose.internose.presentation;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.EmployerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(EmployerController.class)
@AutoConfigureMockMvc(addFilters = false)
public class EmployerControllerTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EmployerService employerService;

    @MockitoBean
    private InternshipOfferDAO internshipOfferDAO;

    @Test
    @DisplayName("Test de GET /api/employer/internship-offers")
    public void testGETInternshipOffers() throws Exception {
        // Arrange
        List<InternshipOfferDTO> internshipOffers = listInternshipOffers();
        when(employerService.listInternshipOffers()).thenReturn(internshipOffers);
        // Act
        MvcResult mvcResult = mockMvc.perform(
            get(Paths.INTERNSHIP_OFFERS_PATH)
            .contentType("application/json")
        ).andReturn();

        // Assert
        List<InternshipOfferDTO> internshipOfferDTOs = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            objectMapper.getTypeFactory().constructCollectionType(List.class, InternshipOfferDTO.class)
        );
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(internshipOfferDTOs.size()).isEqualTo(1);
    }

    @Test
    @DisplayName("Test de POST /api/employer/internship-offers")
    public void testPOSTInternshipOffers() throws Exception {
        // Arrange
        InternshipOfferDTO internshipOfferDTO = listInternshipOffers().getFirst();
        InternshipOffer internshipOffer = InternshipOffer.fromDTO(internshipOfferDTO);
        when(employerService.createInternshipOffer(any(InternshipOfferDTO.class))).thenReturn(Optional.of(internshipOffer));
        // Act
        MvcResult mvcResult = mockMvc.perform(
            post(Paths.INTERNSHIP_OFFERS_PATH)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(internshipOfferDTO))
        ).andReturn();
        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
    }

    private List<InternshipOfferDTO> listInternshipOffers() {
        List<InternshipOfferDTO> offresStage = new ArrayList<>();
        offresStage.add(
            InternshipOfferDTO.builder()
                .jobTitle("Ingénieur logiciel junior chez Hydro-Québec")
                .taskDescription("*description ici*")
                .qualifications("*compétences requises ici*")
                .duration(6)
                .startDate(LocalDate.of(2026, 1, 23))
                .salary(25.0)
                .address("*adresse du stage ici*")
                .build()
        );
        return offresStage;
    }
}
