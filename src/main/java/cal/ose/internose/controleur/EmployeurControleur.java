package cal.ose.internose.controleur;

import cal.ose.internose.service.EmployeurService;
import cal.ose.internose.service.dto.EmployeurDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@RequestMapping("/api")
@AllArgsConstructor
public class EmployeurControleur {
    private EmployeurService employeurService;

    @PostMapping("/employeurs")
    public ResponseEntity<String> creerEmployeur(@RequestBody EmployeurDTO employeurDTO) {
        employeurService.creerEmployeur(employeurDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body("EMPLOYEUR CREATED");
    }
}
