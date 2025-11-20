package cal.ose.internose;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Interview;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.service.DTOs.*;
import cal.ose.internose.service.EmployerService;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import cal.ose.internose.service.UserService;
import cal.ose.internose.utilities.DummyMultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
        InternshipOfferDAO internshipOfferDAO
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
                EmployerDTO karim = employerService.findEmployerByEmail("karim@gmail.com");
                StudentDTO alice = studentService.findStudentByEmail("alice@gmail.com");

                // Téléverser et approuver un CV fictif
                MultipartFile dummyResume = DummyMultipartFile.createDummyResume();
                studentService.uploadResume(alice.getId(), dummyResume);
                internshipManagerService.verifyResume(alice.getId(), true, "");

                userService.registerStudent(
                    StudentDTO.builder()
                        .firstName("Amine")
                        .lastName("A.")
                        .email("amine@gmail.com")
                        .program("420.B0 - Techniques de l'informatique")
                        .institution("AL")
                        .password("Password123!")
                        .build()
                );
                StudentDTO amine = studentService.findStudentByEmail("amine@gmail.com");
                studentService.uploadResume(amine.getId(), dummyResume);
                internshipManagerService.verifyResume(amine.getId(), true, "");
                userService.registerStudent(
                    StudentDTO.builder()
                        .firstName("Walid")
                        .lastName("W.")
                        .email("walid@gmail.com")
                        .program("410.A1 - Gestion des opérations et de la chaîne logistique")
                        .institution("VM")
                        .password("Password123!")
                        .build()
                );
                StudentDTO walid = studentService.findStudentByEmail("walid@gmail.com");
                studentService.uploadResume(walid.getId(), dummyResume);
                internshipManagerService.verifyResume(walid.getId(), true, "");

                // Créer quelques offres de stage en avance
                InternshipOfferDTO kotlinDev = employerService.createInternshipOffer(
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
                InternshipOfferDTO electricEngineer = employerService.createInternshipOffer(
                    karim.getId(),
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
                InternshipOfferDTO architect = employerService.createInternshipOffer(
                    karim.getId(),
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

                // Approuver quelques offres de stage en avance
                internshipManagerService.verifyInternshipOffer(kotlinDev.getId(), true, "");
                internshipManagerService.verifyInternshipOffer(electricEngineer.getId(), true, "");
                internshipManagerService.verifyInternshipOffer(architect.getId(), true, "");

                // Ajouter quelques candidatures aux offres de stage en avance
                studentService.applyToInternshipOffer(alice.getId(), kotlinDev.getId());
                studentService.applyToInternshipOffer(amine.getId(), kotlinDev.getId());
                studentService.applyToInternshipOffer(walid.getId(), kotlinDev.getId());
                studentService.applyToInternshipOffer(amine.getId(), architect.getId());
                studentService.applyToInternshipOffer(walid.getId(), architect.getId());

                // Planifier quelques entrevues en avance
                employerService.scheduleInterview(kotlinDev.getId(), amine.getId(), InterviewDTO.builder()
                    .interviewDate(LocalDateTime.of(2025, 12, 1, 15, 30))
                    .interviewMode(Interview.InterviewMode.ONLINE)
                    .location("https://zoom.us/meeting")
                    .personalizedMessage("Nous sommes ravis de vous rencontrer")
                    .build()
                );
                employerService.scheduleInterview(architect.getId(), amine.getId(), InterviewDTO.builder()
                    .interviewDate(LocalDateTime.of(2025, 12, 1, 13, 30))
                    .interviewMode(Interview.InterviewMode.IN_PERSON)
                    .location("129, rue Rideau")
                    .personalizedMessage("Nous sommes ravis de vous rencontrer")
                    .build()
                );
                employerService.scheduleInterview(kotlinDev.getId(), walid.getId(), InterviewDTO.builder()
                    .interviewDate(LocalDateTime.of(2025, 12, 1, 14, 30))
                    .interviewMode(Interview.InterviewMode.IN_PERSON)
                    .location("129, rue Rideau")
                    .personalizedMessage("Nous sommes ravis de vous rencontrer")
                    .build()
                );

                // Accepter quelques candidatures en avance
                employerService.reviewApplication(kotlinDev.getId(), alice.getId(), true, "");
                employerService.reviewApplication(architect.getId(), amine.getId(), true, "");
                employerService.reviewApplication(architect.getId(), walid.getId(), true, "");

                // Accepter quelques offres de stage en avance
                studentService.respondToApprovedOffer(alice.getId(), kotlinDev.getId(), true);
                studentService.respondToApprovedOffer(walid.getId(), architect.getId(), true);

                // Créer une entente de stage en avance
                int weeklyHours = 35;
                InternshipContractDTO internshipContractDTO = InternshipContractDTO.builder()
                    .studentId(alice.getId())
                    .internshipOfferId(kotlinDev.getId())
                    .startDate(kotlinDev.getStartDate())
                    .endDate(kotlinDev.getEndDate())
                    .weeklyHours(weeklyHours)
                    .tasks("Développement des applications web avec Java et Angular.")
                    .educationalObjectives("Appliquer les connaissances acquises en programmation et apprendre le travail en équipe.")
                    .supervisorName("Jean Tremblay")
                    .supervisorTitle("Chef de l'équipe des programmeurs")
                    .supervisorEmail("jean.tremblay@entreprise.qc.ca")
                    .supervisorPhone("514-555-1234")
                    .build();
                internshipManagerService.createInternshipContract(internshipContractDTO);
                internshipManagerService.assignProfessorToContract(1L, 4L);

                internshipOfferDAO.save(
                    InternshipOffer.builder()
                        .employer(Employer.builder().id(1L).build())
                        .title("Frontend dev")
                        .description("Construire des sites webs")
                        .program("243.D0 - Technologie du génie électrique: automatisation et contrôle")
                        .requiredSkills("DEC en Technique du génie électrique: automatisation et contrôle")
                        .startDate(LocalDate.of(2026, 2, 26))
                        .duration(8)
                        .salary(30.0)
                        .address("Kahnawake, Québec")
                        .session("Autum-2023")
                        .build()
                );
            }
        };
    }
}
