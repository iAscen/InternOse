package cal.ose.internose;

import cal.ose.internose.service.EmployeurService;
import cal.ose.internose.service.dto.EmployeurDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InternOSEApplication implements CommandLineRunner {

    private final EmployeurService employeurService;

    public InternOSEApplication(EmployeurService employeurService) {
        this.employeurService = employeurService;
    }

    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        employeurService.creerEmployeur(new EmployeurDTO("testNom", "testPrenom", "testEmail", "testEntreprise"));
        System.out.println(employeurService.findEmployeur(1L));
    }
}