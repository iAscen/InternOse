package cal.ose.internose.presentation;

import cal.ose.internose.service.AuthService;
import cal.ose.internose.service.DTOs.EmployerDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@RequestMapping("/employer")
@AllArgsConstructor
public class EmployerController {
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> registerEmployer(@RequestBody EmployerDTO employerDTO) {
        String jwt = authService.registerEmployer(employerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(jwt);
    }
}
