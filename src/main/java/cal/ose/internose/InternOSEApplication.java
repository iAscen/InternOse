package cal.ose.internose;

import cal.ose.internose.service.AuthService;
import cal.ose.internose.service.DTOs.InternshipManagerDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InternOSEApplication implements CommandLineRunner {
    private final AuthService authService;

    public InternOSEApplication(AuthService authService) {
        this.authService = authService;
    }

    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Override
    public void run(String... args) {
        InternshipManagerDTO internshipManagerDTO = new InternshipManagerDTO();
        internshipManagerDTO.setEmail("gs@gmail.com");
        internshipManagerDTO.setPassword("Password123!");
        internshipManagerDTO.setFirstName("François");
        internshipManagerDTO.setLastName("L.");
        authService.registerInternshipManager(internshipManagerDTO);
    }
}
