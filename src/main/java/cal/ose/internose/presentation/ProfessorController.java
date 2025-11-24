package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.DTOs.SiteAssessmentDTO;
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

    @PostMapping(Paths.PROFESSOR_INTERNSHIP_SITE_ASSESSMENT)
    public ResponseEntity<String> postSiteAssessment(
        @PathVariable("professorID") Long professorID,
        @RequestParam Long internshipContractID,
        @RequestBody SiteAssessmentDTO siteAssessmentDTO) {
        try {
            SiteAssessmentDTO savedAssessment = professorService.saveSiteAssessment(professorID, internshipContractID, siteAssessmentDTO);
            return getResponseEntity(HttpStatus.CREATED, objectMapper.writeValueAsString(savedAssessment));
        } catch (NoSuchElementException e) {
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
