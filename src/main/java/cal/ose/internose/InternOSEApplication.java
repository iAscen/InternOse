package cal.ose.internose;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.AuthService;
import cal.ose.internose.service.DTOs.InternshipManagerDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InternOSEApplication implements CommandLineRunner {
    @Autowired
    private AuthService authService;

    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Override
    public void run(String... args) {
        InternshipManagerDTO internshipManagerDTO = new InternshipManagerDTO();
        internshipManagerDTO.setEmail("managerEmail@email");
        internshipManagerDTO.setPassword("managerPassword1@");
        internshipManagerDTO.setFirstName("manager");
        internshipManagerDTO.setLastName("manager");

        authService.registerInternshipManager(internshipManagerDTO);
    }
}
