package cal.ose.internose.presentation;

import cal.ose.internose.service.AuthService;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.LoginDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cal.ose.internose.security.Paths;

@RestController
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@AllArgsConstructor
public class AuthController {
    private AuthService authService;

    @PostMapping(Paths.EMPLOYER_REGISTER_PATH)
    public ResponseEntity<String> registerEmployer(@RequestBody EmployerDTO employerDTO) {
        String jwt = authService.registerEmployer(employerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(jwt);
    }

    @PostMapping(Paths.STUDENT_REGISTER_PATH)
    public ResponseEntity<String> registerStudent(@RequestBody StudentDTO studentDTO) {
        String jwt = authService.registerStudent(studentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(jwt);
    }

    @PostMapping(Paths.LOGIN_PATH)
    public ResponseEntity<String> login(@RequestBody LoginDTO loginDTO) {
        String jwt = authService.login(loginDTO);
        return ResponseEntity.ok(jwt);
    }
}
