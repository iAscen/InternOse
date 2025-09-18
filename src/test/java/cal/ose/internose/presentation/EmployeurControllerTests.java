package cal.ose.internose.presentation;

import cal.ose.internose.modele.OffreStage;
import cal.ose.internose.persistance.OffreStageDAO;
import cal.ose.internose.service.DTOs.OffreStageDTO;
import cal.ose.internose.service.EmployeurService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
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

@WebMvcTest(EmployeurController.class)
public class EmployeurControllerTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private OffreStageDAO offreStageDAO;

    @Test
    @DisplayName("Test de GET /api/employeur/offres-stage")
    public void testGETOffresStage() throws Exception {
        // Arrange
        List<OffreStageDTO> offresStage = listerOffresStage();
        when(employeurService.listerOffresStage()).thenReturn(offresStage);
        // Act
        MvcResult mvcResult = mockMvc.perform(
            get("/api/employeur/offres-stage")
            .contentType("application/json")
        ).andReturn();
        // Assert
        List<OffreStageDTO> offresStageDTO = objectMapper.readValue(
            mvcResult.getResponse().getContentAsString(),
            objectMapper.getTypeFactory().constructCollectionType(List.class, OffreStageDTO.class)
        );
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(offresStageDTO.size()).isEqualTo(1);
    }

    @Test
    @DisplayName("Test de POST /api/employeur/offres-stage")
    public void testPOSTOffresStage() throws Exception {
        // Arrange
        OffreStageDTO offreStageDTO = listerOffresStage().getFirst();
        OffreStage offreStage = OffreStage.fromDTO(offreStageDTO);
        when(employeurService.creerOffreStage(any(OffreStageDTO.class))).thenReturn(Optional.of(offreStage));
        // Act
        MvcResult mvcResult = mockMvc.perform(
            post("/api/employeur/offres-stage")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(offreStageDTO))
        ).andReturn();
        // Assert
        assertThat(mvcResult.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
    }

    private List<OffreStageDTO> listerOffresStage() {
        List<OffreStageDTO> offresStage = new ArrayList<>();
        offresStage.add(
            OffreStageDTO.builder()
                .titrePoste("Ingénieur logiciel junior chez Hydro-Québec")
                .descriptionTaches("*description ici*")
                .competencesRequises("*compétences requises ici*")
                .duree(6)
                .dateDebut(LocalDate.of(2026, 1, 23))
                .remuneration(25.0)
                .adresse("*adresse du stage ici*")
                .build()
        );
        return offresStage;
    }
}
