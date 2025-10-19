package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.EmployerDTO;
import cal.ose.internose.service.DTOs.LoginDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.UserService;
import cal.ose.internose.service.exceptions.RequiredFieldException;
import cal.ose.internose.service.exceptions.UserAlreadyExistsException;
import cal.ose.internose.service.exceptions.WeakPasswordException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@AllArgsConstructor
public class AuthController {
    private UserService userService;

    @PostMapping(Paths.EMPLOYER_REGISTER_PATH)
    public ResponseEntity<String> registerEmployer(@RequestBody EmployerDTO employerDTO)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        String jwt = userService.registerEmployer(employerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(jwt);
    }

    @PostMapping(Paths.STUDENT_REGISTER_PATH)
    public ResponseEntity<String> registerStudent(@RequestBody StudentDTO studentDTO)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        String jwt = userService.registerStudent(studentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(jwt);
    }

    @PostMapping(Paths.LOGIN_PATH)
    public ResponseEntity<String> login(@RequestBody LoginDTO loginDTO) {
        String jwt = userService.login(loginDTO);
        return ResponseEntity.ok(jwt);
    }
}
