package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.Employer;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.security.exception.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.ErrorMessages;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployerService {
    private final EmployerDAO employerDAO;
    private final InternshipOfferDAO internshipOfferDAO;
    private final StudentDAO studentDAO;

    public EmployerService(EmployerDAO employerDAO, InternshipOfferDAO internshipOfferDAO, StudentDAO studentDAO) {
        this.employerDAO = employerDAO;
        this.internshipOfferDAO = internshipOfferDAO;
        this.studentDAO = studentDAO;
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

    public List<StudentDTO> findStudentsBy(long internshipId, DocumentStatus cvStatus, String program, String institution) {
        if (!internshipOfferDAO.existsById(internshipId)) {
            throw new ResourceNotFoundException(
                    String.format(ErrorMessages.INTERNSHIP_OFFER_NOT_FOUND.getMessage(), internshipId)
            );
        }

        List<Student> students = studentDAO.findStudentsBy(internshipId, cvStatus, program, institution);

        return students.stream()
                .map((s) -> StudentDTO.builder()
                        .id(s.getId())
                        .firstName(s.getFirstName())
                        .lastName(s.getLastName())
                        .cvStatus(s.getCvStatus())
                        .program(s.getProgram())
                        .institution(s.getInstitution())
                        .build()).collect(Collectors.toList());
    }
}
