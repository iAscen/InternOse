package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.StudentApplication;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.ErrorMessages;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployerService {
    private final EmployerDAO employerDAO;
    private final InternshipOfferDAO internshipOfferDAO;
    private final StudentApplicationDAO studentApplicationDAO;

    public EmployerService(EmployerDAO employerDAO, InternshipOfferDAO internshipOfferDAO, StudentApplicationDAO studentApplicationDAO) {
        this.employerDAO = employerDAO;
        this.internshipOfferDAO = internshipOfferDAO;
        this.studentApplicationDAO = studentApplicationDAO;
    }

    public List<InternshipOfferDTO> listInternshipOffers(Long employerID) {
        Employer employer = employerDAO.findById(employerID).orElseThrow();
        return InternshipOfferDTO.fromEntityList(internshipOfferDAO.findAllByEmployer(employer));
    }

    public Optional<InternshipOffer> createInternshipOffer(Long employerID, InternshipOfferDTO internshipOfferDTO) {
        Employer employer = employerDAO.findById(employerID).orElseThrow();
        InternshipOffer internshipOffer = InternshipOffer.fromDTO(internshipOfferDTO);
        internshipOffer.setValidationStatus(DocumentStatus.PENDING);
        internshipOffer.setEmployer(employer); // Définir l'employeur AVANT de sauvegarder
        internshipOffer = internshipOfferDAO.save(internshipOffer);
        return Optional.of(internshipOffer);
    }

    public List<StudentDTO> findStudentsBy(long internshipId, StudentApplication.ApplicationStatus status, String program, String institution, String sortBy) {
        if (!internshipOfferDAO.existsById(internshipId)) {
            throw new ResourceNotFoundException(
                    String.format(ErrorMessages.INTERNSHIP_OFFER_NOT_FOUND.getMessage(), internshipId)
            );
        }

        List<StudentApplication> applications = studentApplicationDAO.findApplicationsBy(internshipId, status, program, institution);

        Comparator<StudentApplication> comparator = switch (sortBy == null ? "" : sortBy) {
            case "institution" -> Comparator.comparing(app -> app.getStudent().getInstitution());
            case "status" -> Comparator.comparing(app -> app.getStudent().getCvStatus());
            case "applicationDate" -> Comparator.comparing(StudentApplication::getApplicationDate);
            case "applicationStatus" -> Comparator.comparing(StudentApplication::getStatus);
            default -> Comparator.comparing(app -> app.getStudent().getProgram());
        };

        applications = applications.stream().sorted(comparator).toList();

        return applications.stream()
                .map((app) -> StudentDTO.builder()
                        .id(app.getStudent().getId())
                        .firstName(app.getStudent().getFirstName())
                        .lastName(app.getStudent().getLastName())
                        .cvStatus(app.getStudent().getCvStatus())
                        .cvFileName(app.getStudent().getCVFileName())
                        .program(app.getStudent().getProgram())
                        .institution(app.getStudent().getInstitution())
                        .cvFileData(app.getStudent().getCVFileData())
                        .applicationDate(app.getApplicationDate())
                        .applicationStatus(app.getStatus())
                        .email(app.getStudent().getEmail())
                        .build()).collect(Collectors.toList());
    }

    public StudentDTO getStudentApplicationDetails(long internshipId, long studentId) {
        if (!internshipOfferDAO.existsById(internshipId)) {
            throw new ResourceNotFoundException(
                    String.format(ErrorMessages.INTERNSHIP_OFFER_NOT_FOUND.getMessage(), internshipId)
            );
        }

        return studentApplicationDAO.findApplicationsBy(internshipId, null, null, null)
                .stream()
                .filter(app -> app.getStudent().getId().equals(studentId))
                .findFirst()
                .map(app -> StudentDTO.builder()
                        .id(app.getStudent().getId())
                        .firstName(app.getStudent().getFirstName())
                        .lastName(app.getStudent().getLastName())
                        .cvFileName(app.getStudent().getCVFileName())
                        .cvStatus(app.getStudent().getCvStatus())
                        .program(app.getStudent().getProgram())
                        .institution(app.getStudent().getInstitution())
                        .cvFileData(app.getStudent().getCVFileData())
                        .applicationDate(app.getApplicationDate())
                        .applicationStatus(app.getStatus())
                        .build())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found for student " + studentId));
    }
}
