package cal.ose.internose;

import cal.ose.internose.modele.Interview;
import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.service.DTOs.*;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import cal.ose.internose.service.UserService;
import cal.ose.internose.utilities.DummyMultipartFile;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class InternOSEApplication {
    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(
        ObjectProvider<UserService> authServiceProvider,
        ObjectProvider<EmployerService> employerServiceProvider,
        ObjectProvider<StudentService> studentServiceProvider,
        ObjectProvider<InternshipManagerService> internshipManagerServiceProvider
    ) {
        return _ -> {
            UserService userService = authServiceProvider.getIfAvailable();
            EmployerService employerService = employerServiceProvider.getIfAvailable();
            StudentService studentService = studentServiceProvider.getIfAvailable();
            InternshipManagerService internshipManagerService = internshipManagerServiceProvider.getIfAvailable();
            if (userService != null && employerService != null && studentService != null && internshipManagerService != null) {
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
                        .program("420.B0")
                        .institution("AL")
                        .build()
                );
                // Téléverser et approuver un CV fictif
                MultipartFile dummyResume = DummyMultipartFile.createDummyResume("utilities/DummyResume.pdf");
                studentService.uploadResume(2L, dummyResume);
                internshipManagerService.verifyResume(2L, true, "");
                userService.registerInternshipManager(
                    InternshipManagerDTO.builder()
                        .firstName("Bob")
                        .lastName("B.")
                        .email("bob@gmail.com")
                        .password("Password123!")
                        .build()
                );
                userService.registerStudent(
                    StudentDTO.builder()
                        .firstName("Charles")
                        .lastName("C.")
                        .email("charles@gmail.com")
                        .program("420.B0")
                        .institution("AL")
                        .password("Password123!")
                        .build()
                );
                studentService.uploadResume(4L, dummyResume);
                internshipManagerService.verifyResume(4L, true, "");
                userService.registerStudent(
                    StudentDTO.builder()
                        .firstName("Dan")
                        .lastName("D.")
                        .email("dan@gmail.com")
                        .program("322.A1")
                        .institution("VM")
                        .password("Password123!")
                        .build()
                );
                studentService.uploadResume(5L, dummyResume);
                internshipManagerService.verifyResume(5L, true, "");

                // Créer quelques offres de stage en avance
                InternshipOfferDTO kotlinDev = employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .title("Développeur Kotlin")
                        .description("Développer des applications mobiles pour Android")
                        .program("420.B0")
                        .requiredSkills("DEC en Technique de l'Informatique")
                        .startDate(LocalDate.of(2026, 2, 19))
                        .duration(8)
                        .salary(29.0)
                        .address("Laval, Québec")
                        .build()
                );
                kotlinDev.setVerificationStatus(VerificationStatus.APPROVED);
                employerService.createInternshipOffer(
                    1L,
                    InternshipOfferDTO.builder()
                        .title("Développeur Swift")
                        .description("Développer des applications mobiles pour iOS")
                        .program("420.B0")
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
                        .program("420.B0")
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
                        .program("243.D0")
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
                        .program("221.A0")
                        .requiredSkills("DEC en Technologie de l'architecture")
                        .startDate(LocalDate.of(2027, 1, 27))
                        .duration(8)
                        .salary(27.0)
                        .address("Paris, France")
                        .build()
                );

                internshipManagerService.verifyInternshipOffer(5L, true, "");
                internshipManagerService.verifyInternshipOffer(4L, true, "");
                internshipManagerService.verifyInternshipOffer(1L, true, "");

                studentService.applyToInternshipOffer(4L, 1L);
                studentService.applyToInternshipOffer(5L, 1L);

                employerService.scheduleInterview(1L, 4L, InterviewDTO.builder()
                    .interviewDate(LocalDateTime.of(2024, 12, 15, 14, 30))
                    .interviewMode(Interview.InterviewMode.ONLINE)
                    .location("https://zoom.us/meeting")
                    .personalizedMessage("Nous sommes ravis de vous rencontrer")
                    .build()
                );

                employerService.reviewApplication(1L, 4L, true, "");
                employerService.reviewApplication(1L, 5L, false, "Compétences insuffisantes");
            }
        };
    }
}
