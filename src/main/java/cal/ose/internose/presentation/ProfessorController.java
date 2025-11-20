package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.ProfessorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class ProfessorController {
    private final ProfessorService professorService;
    private final ObjectMapper objectMapper;

    @GetMapping(Paths.PROFESSOR_INTERNSHIP_CONTRACTS)
    public ResponseEntity<String> findInternshipContracts(@PathVariable("professorID") long professorid) {
        try {
            List<InternshipContractDTO> internshipContracts = professorService.findInternshipContracts(professorid);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(internshipContracts));
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, String body) {
        return ResponseEntity.status(status).body(body);
    }
}
