package cal.ose.internose;

import cal.ose.internose.service.AuthService;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.InternshipManagerDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.EmployerService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class InternOSEApplication {
    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ObjectProvider<AuthService> authServiceProvider, ObjectProvider<EmployerService> employerServiceProvider) {
        // NE PAS SUPPRIMER! Ces données sont nécessaires pour la démo.
        return _ -> {
            AuthService authService = authServiceProvider.getIfAvailable();
            EmployerService employerService = employerServiceProvider.getIfAvailable();
            if (authService != null && employerService != null) {
                EmployerDTO employerDTO = new EmployerDTO();
                employerDTO.setFirstName("Karim");
                employerDTO.setLastName("M.");
                employerDTO.setEmail("karim@gmail.com");
                employerDTO.setPassword("Password123!");
                employerDTO.setEnterprise("SQL Tech.");
                authService.registerEmployer(employerDTO);

                StudentDTO studentDTO = new StudentDTO();
                studentDTO.setFirstName("Walid");
                studentDTO.setLastName("W.");
                studentDTO.setEmail("walid@gmail.com");
                studentDTO.setPassword("Password123!");
                authService.registerStudent(studentDTO);

                InternshipManagerDTO internshipManagerDTO = new InternshipManagerDTO();
                internshipManagerDTO.setFirstName("Amine");
                internshipManagerDTO.setLastName("A.");
                internshipManagerDTO.setEmail("amine@gmail.com");
                internshipManagerDTO.setPassword("Password123!");
                authService.registerInternshipManager(internshipManagerDTO);

                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .jobTitle("Développeur Kotlin")
                        .taskDescription("Développer des applications mobiles pour Android")
                        .qualifications("DEC en Technique de l'Informatique")
                        .domain("Informatique")
                        .startDate(LocalDate.of(2026, 2, 19))
                        .duration(8)
                        .salary(29.0)
                        .address("Laval, Québec")
                        .build()
                );
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .jobTitle("Développeur Swift")
                        .taskDescription("Développer des applications mobiles pour iOS")
                        .qualifications("DEC en Technique de l'Informatique")
                        .domain("Informatique")
                        .startDate(LocalDate.of(2026, 3, 1))
                        .duration(8)
                        .salary(20.0)
                        .address("Montréal, Québec")
                        .build()
                );
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .jobTitle("Concepteur UI/UX")
                        .taskDescription("Concevoir des expériences utilisateur")
                        .qualifications("DEC en Technique de l'Informatique")
                        .domain("Informatique")
                        .startDate(LocalDate.of(2026, 1, 29))
                        .duration(8)
                        .salary(25.0)
                        .address("Paris, France")
                        .build()
                );
            }
        };
    }
}
