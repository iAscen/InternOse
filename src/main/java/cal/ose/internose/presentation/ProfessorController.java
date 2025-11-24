package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternAssessmentDTO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.ProfessorService;
import cal.ose.internose.service.exceptions.ForbiddenException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class ProfessorController {
    private final ProfessorService professorService;
    private final ObjectMapper objectMapper;

    @GetMapping(Paths.PROFESSOR_INTERNSHIP_CONTRACTS)
    public ResponseEntity<String> findInternshipContracts(@PathVariable("professorID") long professorId,
                                                          @RequestParam(value = "studentName", required = false) String studentName,
                                                          @RequestParam(value = "company", required = false) String company,
                                                          @RequestParam(value = "program", required = false) String internshipProgram,
                                                          @RequestParam(value = "sortBy", required = false) String sortBy) {
        try {
            List<InternshipContractDTO> internshipContracts = professorService.findInternshipContractsBy(professorId, studentName, company, internshipProgram, sortBy);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(internshipContracts));
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (ForbiddenException e) {
            return getResponseEntity(HttpStatus.FORBIDDEN, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.PROFESSOR_INTERNSHIP_CONTRACT_ASSESSMENT)
    public ResponseEntity<String> findInternAssessment(@PathVariable("contractID") long contractId) {
        try {
            InternAssessmentDTO internAssessmentDTO = professorService.findInternAssessment(contractId);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(internAssessmentDTO));
        } catch (NoSuchElementException e)  {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (ForbiddenException e) {
            return getResponseEntity(HttpStatus.FORBIDDEN, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, String body) {
        return ResponseEntity.status(status).body(body);
    }
}
