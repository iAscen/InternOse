package cal.ose.internose;

import cal.ose.internose.service.AuthService;
import cal.ose.internose.service.DTOs.InternshipManagerDTO;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class InternOSEApplication {

    public static void main(String[] args) {
        SpringApplication.run(InternOSEApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ObjectProvider<AuthService> authServiceProvider) {
        return _ -> {
            AuthService authService = authServiceProvider.getIfAvailable();
            if (authService != null) {
                // Seulement le gestionnaire de stages
                InternshipManagerDTO internshipManagerDTO = new InternshipManagerDTO();
                internshipManagerDTO.setFirstName("Amine");
                internshipManagerDTO.setLastName("A.");
                internshipManagerDTO.setEmail("amine@gmail.com");
                internshipManagerDTO.setPassword("Password123!");
                authService.registerInternshipManager(internshipManagerDTO);
            }
        };
    }
}
