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

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class UserController {
    private UserService userService;

    @PostMapping(Paths.EMPLOYER_REGISTER_PATH)
    public ResponseEntity<String> registerEmployer(@RequestBody EmployerDTO employerDTO)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        String jwt = userService.registerEmployer(employerDTO);
        return getResponseEntity(HttpStatus.CREATED, jwt);
    }

    @PostMapping(Paths.STUDENT_REGISTER_PATH)
    public ResponseEntity<String> registerStudent(@RequestBody StudentDTO studentDTO)
        throws RequiredFieldException, UserAlreadyExistsException, WeakPasswordException {
        String jwt = userService.registerStudent(studentDTO);
        return getResponseEntity(HttpStatus.CREATED, jwt);
    }

    @PostMapping(Paths.LOGIN_PATH)
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            String jwt = userService.login(loginDTO);
            return getResponseEntity(HttpStatus.OK, jwt);
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.FORBIDDEN, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PutMapping(Paths.SET_SESSION_PATH)
    public ResponseEntity<?> setSession(@RequestBody Map<String, Object> body) {
        try {
            Long id = (Long) body.get("id");
            String session = (String) body.get("session");

            userService.setSession(id, session);

            return getResponseEntity(HttpStatus.OK, session);
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (IllegalArgumentException e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, String body) {
        return ResponseEntity.status(status).body(body);
    }
}
