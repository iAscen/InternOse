package cal.ose.internose;

import cal.ose.internose.service.*;
import cal.ose.internose.service.DTOs.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class InternOSEApplication {
    // Utilisez ce logger à la place des System.out.println()
    public static final Logger LOGGER = LoggerFactory.getLogger("InternOSE-logger");

    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(
        ObjectProvider<UserService> authServiceProvider,
        ObjectProvider<EmployerService> employerServiceProvider,
        ObjectProvider<StudentService> studentServiceProvider,
        ObjectProvider<InternshipManagerService> internshipManagerServiceProvider,
        ObjectProvider<ProfessorService> professorServiceProvider
    ) {
        return _ -> {
            UserService userService = authServiceProvider.getIfAvailable();
            EmployerService employerService = employerServiceProvider.getIfAvailable();
            StudentService studentService = studentServiceProvider.getIfAvailable();
            InternshipManagerService internshipManagerService = internshipManagerServiceProvider.getIfAvailable();
            ProfessorService professorService = professorServiceProvider.getIfAvailable();
            if (userService != null && employerService != null && studentService != null && internshipManagerService != null && professorService != null) {
                // Créer les comptes utilisateurs
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
                        .program("420.B0 - Techniques de l'informatique")
                        .institution("AL")
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
                userService.registerProfessor(
                    ProfessorDTO.builder()
                        .firstName("Thomas")
                        .lastName("C.")
                        .email("toto@gmail.com")
                        .password("Password123!")
                        .build()
                );

                // Récupérer l'employeur pour créer les offres
                EmployerDTO karim = employerService.findEmployerByEmail("karim@gmail.com");

                // Créer 3 offres de stage pour le programme Informatique (non validées)
                employerService.createInternshipOffer(
                    karim.getId(),
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
                employerService.createInternshipOffer(
                    karim.getId(),
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
                    karim.getId(),
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
                    karim.getId(),
                    InternshipOfferDTO.builder()
                        .title("Développeur Full Stack")
                        .description("Développer des applications web complètes")
                        .program("420.B0 - Techniques de l'informatique")
                        .requiredSkills("DEC en Technique de l'Informatique")
                        .startDate(LocalDate.of(2025, 3, 15))
                        .duration(8)
                        .salary(28.0)
                        .address("Québec, Québec")
                        .build()
                );
            }
        };
    }
}
