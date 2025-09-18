package cal.ose.internose;

import cal.ose.internose.service.DTOs.OffreStageDTO;
import cal.ose.internose.service.EmployeurService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class InternOSEApplication {
    private final EmployeurService employeurService;

    public InternOSEApplication(EmployeurService employeurService) {
        this.employeurService = employeurService;
    }

    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(EmployeurService employeurService) {
        return args -> {
            employeurService.creerOffreStage(
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
        };
    }
}
