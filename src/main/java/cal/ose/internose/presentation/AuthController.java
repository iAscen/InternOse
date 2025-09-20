package cal.ose.internose.presentation;

import cal.ose.internose.service.AuthService;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@RequestMapping("/register")
@AllArgsConstructor
public class AuthController {
    private AuthService authService;

    @PostMapping("/employer")
    public ResponseEntity<String> registerEmployer(@RequestBody EmployerDTO employerDTO) {
        String jwt = authService.registerEmployer(employerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(jwt);
    }

    @PostMapping("/student")
    public ResponseEntity<String> registerStudent(@RequestBody StudentDTO studentDTO) {
        String jwt = authService.registerStudent(studentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(jwt);
    }
}
