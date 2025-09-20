package cal.ose.internose.service;

import cal.ose.internose.modele.OffreStage;
import cal.ose.internose.persistance.OffreStageDAO;
import cal.ose.internose.service.DTOs.OffreStageDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeurService Tests")
public class EmployeurServiceTests {
    @Mock
    private OffreStageDAO offreStageDAO;

    @InjectMocks
    private EmployeurService employeurService;

    @Test
    @DisplayName("Test de la méthode listerOffresStages()")
    public void testListerOffresStage() {
        // Arrange
        when(offreStageDAO.findAll()).thenReturn(listerOffresStage());
        // Act
        List<OffreStageDTO> offresStageDTO = employeurService.listerOffresStage();
        // Assert
        assertThat(offresStageDTO.size()).isEqualTo(1);
        verify(offreStageDAO, times(1)).findAll();
    }

    @Test
    @DisplayName("Test de la méthode creerOffreStage()")
    public void testCreerOffreStage() {
        // Arrange
        OffreStage offreStage = listerOffresStage().getFirst();
        OffreStageDTO offreStageDTO = OffreStageDTO.fromEntity(offreStage);
        when(offreStageDAO.save(any(OffreStage.class))).thenReturn(offreStage);
        // Act
        Optional<OffreStage> nouvelleOffreStage = employeurService.creerOffreStage(offreStageDTO);
        // Assert
        assertThat(nouvelleOffreStage).isPresent();
        verify(offreStageDAO, times(1)).save(any(OffreStage.class));
    }

    private List<OffreStage> listerOffresStage() {
        List<OffreStage> offresStage = new ArrayList<>();
        offresStage.add(
            OffreStage.builder()
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
