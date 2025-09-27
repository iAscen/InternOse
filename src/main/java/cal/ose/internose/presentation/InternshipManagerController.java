package cal.ose.internose.presentation;

import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.InternshipManagerService;
import lombok.AllArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import cal.ose.internose.security.Paths;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipManagerController {
    private InternshipManagerService internshipManagerService;

    @GetMapping(Paths.SEARCH_INTERNSHIPS_PATH)
    public ResponseEntity<List<InternshipOfferDTO>> findInternshipsBy(@RequestParam(required = false) String domain,
                                                                      @RequestParam(required = false) Boolean valid,
                                                                      @RequestParam(required = false) String enterprise,
                                                                      @RequestParam(required = false) String filter) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(internshipManagerService.findInternshipsBy(domain, valid, enterprise, filter));
    }
}
