package cal.ose.internose.service;

import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class EmployerService {
    private final EmployerDAO employerDAO;
    private final InternshipOfferDAO internshipOfferDAO;
    private final StudentApplicationDAO studentApplicationDAO;

    public List<InternshipOfferDTO> listInternshipOffers(Long employerID) throws ResourceNotFoundException {
        Employer employer = employerDAO.findById(employerID)
            .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));
        return InternshipOfferDTO.fromEntityList(internshipOfferDAO.findAllByEmployer(employer));
    }

    public Optional<InternshipOfferDTO> createInternshipOffer(Long employerID, InternshipOfferDTO internshipOfferDTO) throws ResourceNotFoundException {
        Employer employer = employerDAO.findById(employerID)
            .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));
        InternshipOffer internshipOffer = InternshipOffer.fromDTO(internshipOfferDTO);
        internshipOffer.setEmployer(employer);
        internshipOffer.setVerificationStatus(VerificationStatus.PENDING);
        internshipOffer = internshipOfferDAO.save(internshipOffer);
        return Optional.of(InternshipOfferDTO.fromEntity(internshipOffer));
    }

    public List<StudentDTO> findApplicationsBy(
        Long internshipOfferID,
        VerificationStatus verificationStatus,
        String institution,
        String program,
        String sortBy
    ) throws ResourceNotFoundException {
        internshipOfferDAO.findById(internshipOfferID)
            .orElseThrow(() -> new ResourceNotFoundException("Internship offer not found"));

        List<StudentApplication> applications = studentApplicationDAO.findApplicationsBy(
            internshipOfferID, verificationStatus, institution, program
        );

        Comparator<StudentApplication> comparator = switch (sortBy == null ? "" : sortBy) {
            case "institution" ->
                Comparator.comparing(studentApplication -> 
                    studentApplication.getStudent().getInstitution() != null ? 
                    studentApplication.getStudent().getInstitution() : "");
            case "status" ->
                Comparator.comparing(studentApplication -> studentApplication.getStudent().getResumeVerificationStatus());
            case "applicationDate" -> Comparator.comparing(StudentApplication::getApplicationDate);
            case "applicationStatus" -> Comparator.comparing(StudentApplication::getApplicationStatus);
            default -> Comparator.comparing(studentApplication -> 
                studentApplication.getStudent().getProgram() != null ? 
                studentApplication.getStudent().getProgram() : "");
        };

        applications = applications.stream().sorted(comparator).toList();

        return applications.stream().map(
            (studentApplication) ->
                StudentDTO.builder()
                    .id(studentApplication.getStudent().getId())
                    .firstName(studentApplication.getStudent().getFirstName())
                    .lastName(studentApplication.getStudent().getLastName())
                    .resumeVerificationStatus(studentApplication.getStudent().getResumeVerificationStatus())
                    .program(studentApplication.getStudent().getProgram())
                    .institution(studentApplication.getStudent().getInstitution())
                    .resumeFileData(studentApplication.getStudent().getResumeFileData())
                    .applicationDate(studentApplication.getApplicationDate())
                    .applicationStatus(studentApplication.getApplicationStatus())
                    .build()
        ).collect(Collectors.toList());
    }

    public StudentDTO getApplicationDetails(Long internshipOfferID, Long studentID) throws ResourceNotFoundException {
        internshipOfferDAO.findById(internshipOfferID)
            .orElseThrow(() -> new ResourceNotFoundException("Internship offer not found"));

        return studentApplicationDAO.findApplicationsBy(internshipOfferID, null, null, null)
            .stream()
            .filter(app -> app.getStudent().getId().equals(studentID))
            .findFirst()
            .map((studentApplication) ->
                StudentDTO.builder()
                    .id(studentApplication.getStudent().getId())
                    .firstName(studentApplication.getStudent().getFirstName())
                    .lastName(studentApplication.getStudent().getLastName())
                    .resumeVerificationStatus(studentApplication.getStudent().getResumeVerificationStatus())
                    .program(studentApplication.getStudent().getProgram())
                    .institution(studentApplication.getStudent().getInstitution())
                    .resumeFileData(studentApplication.getStudent().getResumeFileData())
                    .applicationDate(studentApplication.getApplicationDate())
                    .applicationStatus(studentApplication.getApplicationStatus())
                    .build()
            ).orElseThrow(() -> new ResourceNotFoundException("Student application not found"));
    }
}
