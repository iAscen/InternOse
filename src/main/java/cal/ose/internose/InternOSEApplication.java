package cal.ose.internose;

import cal.ose.internose.modele.Student;
import cal.ose.internose.service.AuthService;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.InternshipManagerDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@SpringBootApplication
public class InternOSEApplication {
    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ObjectProvider<AuthService> authServiceProvider,
                                               ObjectProvider<EmployerService> employerServiceProvider,
                                               ObjectProvider<StudentService> studentServiceProvider, ObjectProvider<InternshipManagerService> internshipManagerServiceProvider) {
        // NE PAS SUPPRIMER! Ces données sont nécessaires pour la démo.
        return _ -> {
            AuthService authService = authServiceProvider.getIfAvailable();
            EmployerService employerService = employerServiceProvider.getIfAvailable();
            StudentService studentService = studentServiceProvider.getIfAvailable();
            InternshipManagerService internshipManagerService = internshipManagerServiceProvider.getIfAvailable();
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
                studentDTO.setProgram("Informatique");
                studentDTO.setInstitution("AL");
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
                        .program("420.B0 - Techniques de l'informatique")
                        .qualifications("DEC en Technique de l'Informatique")
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
                        .program("420.B0 - Techniques de l'informatique")
                        .qualifications("DEC en Technique de l'Informatique")
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
                        .program("420.B0 - Techniques de l'informatique")
                        .qualifications("DEC en Technique de l'Informatique")
                        .startDate(LocalDate.of(2026, 1, 29))
                        .duration(8)
                        .salary(25.0)
                        .address("Paris, France")
                        .build()
                );
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .jobTitle("Ingénieur électrique")
                        .taskDescription("Construire et travailler sur des mécanismes électriques")
                        .program("243.D0 - Technologie du génie électrique: automatisation et contrôle")
                        .qualifications("DEC en Technique du génie électrique: automatisation et contrôle")
                        .startDate(LocalDate.of(2026, 2, 26))
                        .duration(8)
                        .salary(30.0)
                        .address("Kahnawake, Québec")
                        .build()
                );
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .jobTitle("Architecte")
                        .taskDescription("Planifier la construction des bâtiments")
                        .program("221.A0 - Technologie de l'architecture")
                        .qualifications("DEC en Technologie de l'architecture")
                        .startDate(LocalDate.of(2027, 1, 27))
                        .duration(8)
                        .salary(27.0)
                        .address("Paris, France")
                        .build()
                );
            }
        };
    }
}
