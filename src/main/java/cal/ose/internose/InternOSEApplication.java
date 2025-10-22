package cal.ose.internose;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.InternshipManagerDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.StudentService;
import cal.ose.internose.service.UserService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.util.Optional;

@SpringBootApplication
public class InternOSEApplication {
    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(
        ObjectProvider<UserService> authServiceProvider,
        ObjectProvider<EmployerService> employerServiceProvider,
        ObjectProvider<StudentService> studentServiceProvider
    ) {
        return _ -> {
            UserService userService = authServiceProvider.getIfAvailable();
            EmployerService employerService = employerServiceProvider.getIfAvailable();
            StudentService studentService = studentServiceProvider.getIfAvailable();
            if (userService != null && employerService != null && studentService != null) {
                // Créer quelques utilisateurs en avance
                userService.registerEmployer(
                    EmployerDTO.builder()
                        .firstName("Karim")
                        .lastName("M.")
                        .email("karim@gmail.com")
                        .password("Password123!")
                        .company("SQL Technologies")
                        .build()
                );
                userService.registerStudent(
                    StudentDTO.builder()
                        .firstName("Alice")
                        .lastName("A.")
                        .email("alice@gmail.com")
                        .password("Password123!")
                        .build()
                );
                userService.registerInternshipManager(
                    InternshipManagerDTO.builder()
                        .firstName("Bob")
                        .lastName("B.")
                        .email("bob@gmail.com")
                        .password("Password123!")
                        .build()
                );

                // Créer quelques offres de stage en avance
                Optional<InternshipOfferDTO> kotlinDev = employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .title("Développeur Kotlin")
                        .description("Développer des applications mobiles pour Android")
                        .program("420.B0 - Techniques de l'informatique")
                        .requiredSkills("DEC en Technique de l'Informatique")
                        .startDate(LocalDate.of(2026, 2, 19))
                        .duration(8)
                        .salary(29.0)
                        .address("Laval, Québec")
                        .build()
                );
                kotlinDev.ifPresent(
                    internshipOfferDTO
                        -> internshipOfferDTO.setVerificationStatus(VerificationStatus.APPROVED)
                );
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .title("Développeur Swift")
                        .description("Développer des applications mobiles pour iOS")
                        .program("420.B0 - Techniques de l'informatique")
                        .requiredSkills("DEC en Technique de l'Informatique")
                        .startDate(LocalDate.of(2026, 3, 1))
                        .duration(8)
                        .salary(20.0)
                        .address("Montréal, Québec")
                        .build()
                );
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .title("Concepteur UI/UX")
                        .description("Concevoir des expériences utilisateur")
                        .program("420.B0 - Techniques de l'informatique")
                        .requiredSkills("DEC en Technique de l'Informatique")
                        .startDate(LocalDate.of(2026, 1, 29))
                        .duration(8)
                        .salary(25.0)
                        .address("Paris, France")
                        .build()
                );
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .title("Ingénieur électrique")
                        .description("Construire et travailler sur des mécanismes électriques")
                        .program("243.D0 - Technologie du génie électrique: automatisation et contrôle")
                        .requiredSkills("DEC en Technique du génie électrique: automatisation et contrôle")
                        .startDate(LocalDate.of(2026, 2, 26))
                        .duration(8)
                        .salary(30.0)
                        .address("Kahnawake, Québec")
                        .build()
                );
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .title("Architecte")
                        .description("Planifier la construction des bâtiments")
                        .program("221.A0 - Technologie de l'architecture")
                        .requiredSkills("DEC en Technologie de l'architecture")
                        .startDate(LocalDate.of(2027, 1, 27))
                        .duration(8)
                        .salary(27.0)
                        .address("Paris, France")
                        .build()
                );

                // Test de candidature supprimé - nécessite un CV approuvé
                // studentService.applyToInternshipOffer(2L, 1L);
                // List<StudentDTO> applications = employerService.findApplicationsBy(1L, null, "AL", null, null);
                // System.out.println(applications);
            }
        };
    }
}
