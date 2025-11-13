package cal.ose.internose.presentation;

import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.ProfessorDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.InternshipManagerService;
import cal.ose.internose.service.StudentService;
import cal.ose.internose.service.exceptions.InternshipContractAlreadyExistsException;
import cal.ose.internose.service.exceptions.InternshipOfferNotAcceptedByStudentException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class InternshipManagerController {
    private final InternshipManagerService internshipManagerService;
    private final StudentService studentService;
    private final ObjectMapper objectMapper;

    @GetMapping(Paths.INTERNSHIP_MANAGER_OFFERS_PATH)
    public ResponseEntity<String> getAllEmployersInternshipOffers(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String isVerified,
        @RequestParam(required = false) String program,
        @RequestParam(required = false) String title
    ) {
        Boolean isVerifiedBoolean = null;
        if (isVerified != null && !isVerified.equals("null") && !isVerified.isEmpty())
            isVerifiedBoolean = Boolean.parseBoolean(isVerified);

        try {
            List<InternshipOfferDTO> internshipOfferDTOs = internshipManagerService.findInternshipsBy(
                isVerifiedBoolean, program, title, sortBy
            );

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(internshipOfferDTOs));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_VERIFY_OFFER_PATH)
    public ResponseEntity<String> verifyInternshipOffer(
        @RequestParam Long internshipOfferID,
        @RequestParam Boolean isApproved,
        @RequestParam(required = false) String comment
    ) {
        try {
            InternshipOfferDTO verifiedInternshipOffer =
                internshipManagerService.verifyInternshipOffer(internshipOfferID, isApproved, comment);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(verifiedInternshipOffer));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_RESUMES_PATH)
    public ResponseEntity<String> getAllStudentsResumes(
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String sortOrder,
        @RequestParam(required = false) String status
    ) {
        if (sortBy != null && sortBy.trim().isEmpty()) sortBy = null;
        if (sortOrder != null && sortOrder.trim().isEmpty()) sortOrder = null; // Utiliser l'ordre par défaut (ascendant)

        try {
            List<StudentDTO> studentDTOs = studentService.getAllStudentsWithResumes(sortBy, sortOrder, status);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(studentDTOs));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_RESUME_PATH)
    public ResponseEntity<String> getStudentResumeDetails(@PathVariable Long studentID) {
        try {
            StudentDTO studentDTO = studentService.getStudentByID(studentID);
            List<String> studentResumeDetails = getStudentResumeDetails(studentDTO);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(studentResumeDetails));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_DOWNLOAD_RESUME_PATH)
    public ResponseEntity<?> downloadStudentResume(@PathVariable Long studentID) {
        try {
            StudentDTO studentDTO = studentService.getStudentByID(studentID);
            byte[] resumeData = studentDTO.getResumeFileData();
            ByteArrayResource byteArrayResource = new ByteArrayResource(resumeData);
            
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            httpHeaders.setContentDisposition(ContentDisposition.attachment().filename(studentDTO.getResumeFileName()).build());
            httpHeaders.setContentLength(resumeData.length);

            return ResponseEntity.ok().headers(httpHeaders).body(byteArrayResource);
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PostMapping(Paths.INTERNSHIP_MANAGER_VERIFY_RESUME_PATH)
    public ResponseEntity<String> verifyStudentResume(
        @PathVariable Long studentID,
        @RequestParam Boolean isApproved,
        @RequestParam(required = false) String rejectionReason
    ) {
        try {
            StudentDTO studentWithVerifiedResume =
                internshipManagerService.verifyResume(studentID, isApproved, rejectionReason);
            List<String> verifiedStudentResumeDetails = getStudentResumeDetails(studentWithVerifiedResume);

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(verifiedStudentResumeDetails));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH)
    public ResponseEntity<String> findAllInternshipContracts() {
        try {
            List<InternshipContractDTO> internshipContractDTOs = internshipManagerService.findAllInternshipContracts();

            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(internshipContractDTOs));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST,  "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PostMapping(Paths.INTERNSHIP_MANAGER_INTERNSHIP_CONTRACTS_PATH)
    public ResponseEntity<String> createInternshipContract(@RequestBody InternshipContractDTO InternshipContractDTO) {
        try {
            internshipManagerService.createInternshipContract(InternshipContractDTO);
            return getResponseEntity(HttpStatus.CREATED, objectMapper.writeValueAsString(InternshipContractDTO));
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (InternshipOfferNotAcceptedByStudentException | InternshipContractAlreadyExistsException e) {
            return getResponseEntity(HttpStatus.CONFLICT, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PostMapping(Paths.INTERNSHIP_MANAGER_SIGN_CONTRACT_PATH)
    public ResponseEntity<String> signContract(@PathVariable Long contractId) {
        try {
            InternshipContractDTO signedContract = internshipManagerService.signContract(contractId);
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(signedContract));
        } catch (NoSuchElementException e) {
            return getResponseEntity(HttpStatus.NOT_FOUND, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (IllegalStateException e) {
            return getResponseEntity(HttpStatus.CONFLICT, "{ \"message\": \"" + e.getMessage() + "\" }");
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @GetMapping(Paths.INTERNSHIP_MANAGER_PROFESSORS_PATH)
    public ResponseEntity<String> getAllProfessors() {
        try {
            List<ProfessorDTO> professors = internshipManagerService.findAllProfessors();
            return getResponseEntity(HttpStatus.OK, objectMapper.writeValueAsString(professors));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    @PostMapping(Paths.INTERNSHIP_MANAGER_ASSIGN_PROFESSOR_TO_STUDENT_PATH)
    public ResponseEntity<String> assignProfessorToStudent(@PathVariable Long professorID, @RequestParam Long studentID) {
        try {
            StudentDTO studentWithProfessor = internshipManagerService.assignProfessorToStudent(professorID, studentID);
            return getResponseEntity(HttpStatus.CREATED, objectMapper.writeValueAsString(studentWithProfessor));
        } catch (Exception e) {
            return getResponseEntity(HttpStatus.BAD_REQUEST, "{ \"message\": \"" + e.getMessage() + "\" }");
        }
    }

    private List<String> getStudentResumeDetails(StudentDTO studentDTO) {
        return List.of(
            studentDTO.getResumeVerificationStatus() != null ? studentDTO.getResumeVerificationStatus().toString() : "",
            studentDTO.getResumeUploadDate() != null ? studentDTO.getResumeUploadDate().toString() : "",
            studentDTO.getResumeFileName() != null ? studentDTO.getResumeFileName() : "",
            studentDTO.getResumeFileType() != null ? studentDTO.getResumeFileType() : "",
            studentDTO.getResumeFileData() != null ? Base64.getEncoder().encodeToString(studentDTO.getResumeFileData()) : "",
            studentDTO.getResumeVerifiedDate() != null ? studentDTO.getResumeVerifiedDate().toString() : "",
            studentDTO.getResumeRejectionReason() != null ? studentDTO.getResumeRejectionReason() : ""
        );
    }

    private ResponseEntity<String> getResponseEntity(HttpStatus status, String body) {
        return ResponseEntity.status(status).body(body);
    }
}
