package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.InterviewDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.InterviewDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.InterviewAlreadyScheduledException;
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
    private final InterviewDAO interviewDAO;

    public List<InternshipOfferDTO> listInternshipOffers(Long employerID) {
        Employer employer = employerDAO.findById(employerID).orElseThrow();
        return InternshipOfferDTO.fromEntityList(internshipOfferDAO.findAllByEmployer(employer));
    }

    public InternshipOfferDTO createInternshipOffer(Long employerID, InternshipOfferDTO internshipOfferDTO) {
        Employer employer = employerDAO.findById(employerID).orElseThrow();
        InternshipOffer internshipOffer = InternshipOffer.fromDTO(internshipOfferDTO);
        internshipOffer.setEmployer(employer);
        internshipOffer.setVerificationStatus(VerificationStatus.PENDING);
        internshipOffer = internshipOfferDAO.save(internshipOffer);
        return InternshipOfferDTO.fromEntity(internshipOffer);
    }

    public List<StudentDTO> getStudentApplications(
        Long internshipOfferID,
        StudentApplication.ApplicationStatus applicationStatus,
        String institution,
        String program,
        String sortBy
    ) {
        internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        List<StudentApplication> applications = studentApplicationDAO.findBy(
            internshipOfferID, applicationStatus, institution, program);
        Comparator<StudentApplication> comparator = switch (sortBy == null ? "" : sortBy) {
            case "institution" -> Comparator.comparing(studentApplication
                -> studentApplication.getStudent().getInstitution() != null
                    ? studentApplication.getStudent().getInstitution()
                    : ""
            );
            case "status" -> Comparator
                .comparing(studentApplication
                    -> studentApplication.getStudent().getResumeVerificationStatus()
                );
            case "applicationDate" -> Comparator.comparing(StudentApplication::getApplicationDate);
            case "applicationStatus" -> Comparator.comparing(StudentApplication::getApplicationStatus);
            default -> Comparator.comparing(studentApplication
                -> studentApplication.getStudent().getProgram() != null
                    ? studentApplication.getStudent().getProgram()
                    : ""
            );
        };
        applications = applications.stream().sorted(comparator).toList();

        return applications.stream().map(
                (studentApplication) -> StudentDTO.builder()
                    .id(studentApplication.getStudent().getId())
                    .firstName(studentApplication.getStudent().getFirstName())
                    .lastName(studentApplication.getStudent().getLastName())
                    .resumeVerificationStatus(studentApplication.getStudent().getResumeVerificationStatus())
                    .program(studentApplication.getStudent().getProgram())
                    .institution(studentApplication.getStudent().getInstitution())
                    .resumeFileData(studentApplication.getStudent().getResumeFileData())
                    .applicationDate(studentApplication.getApplicationDate())
                    .applicationStatus(studentApplication.getApplicationStatus())
                    .build())
            .collect(Collectors.toList());
    }

    public StudentDTO getStudentApplicationDetails(Long internshipOfferID, Long studentID) {
        internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        return studentApplicationDAO.findBy(internshipOfferID, null, null, null)
            .stream()
            .filter(app -> app.getStudent().getId().equals(studentID))
            .findFirst()
            .map((studentApplication)-> StudentDTO.builder()
                .id(studentApplication.getStudent().getId())
                .firstName(studentApplication.getStudent().getFirstName())
                .lastName(studentApplication.getStudent().getLastName())
                .resumeVerificationStatus(studentApplication.getStudent().getResumeVerificationStatus())
                .program(studentApplication.getStudent().getProgram())
                .institution(studentApplication.getStudent().getInstitution())
                .resumeFileData(studentApplication.getStudent().getResumeFileData())
                .applicationDate(studentApplication.getApplicationDate())
                .applicationStatus(studentApplication.getApplicationStatus())
                .build())
            .orElseThrow();
    }

    public InterviewDTO scheduleInterview(Long internshipOfferID, Long studentID, InterviewDTO interviewDTO)
        throws InterviewAlreadyScheduledException {
        internshipOfferDAO.findById(internshipOfferID).orElseThrow();

        StudentApplication studentApplication = studentApplicationDAO.findBy(internshipOfferID, null, null, null)
            .stream()
            .filter(app -> app.getStudent().getId().equals(studentID))
            .findFirst()
            .orElseThrow();

        if (interviewDAO.existsByStudentApplication(studentApplication))
            throw new InterviewAlreadyScheduledException("Une entrevue est déjà planifiée pour cette candidature");
        Interview interview = Interview.builder()
            .studentApplication(studentApplication)
            .interviewDate(interviewDTO.getInterviewDate())
            .interviewMode(interviewDTO.getInterviewMode())
            .location(interviewDTO.getLocation())
            .personalizedMessage(interviewDTO.getPersonalizedMessage())
            .interviewStatus(Interview.InterviewStatus.SCHEDULED)
            .build();
        interview = interviewDAO.save(interview);

        studentApplication.setApplicationStatus(StudentApplication.ApplicationStatus.PENDING_INTERVIEW);
        studentApplicationDAO.save(studentApplication);

        return InterviewDTO.fromEntity(interview);
    }

    public List<InterviewDTO> getInterviewsByEmployer(Long employerID) {
        Employer employer = employerDAO.findById(employerID).orElseThrow();
        List<Interview> interviews = interviewDAO.findByEmployer(employer);
        return InterviewDTO.fromEntityList(interviews);
    }

    public Optional<InterviewDTO> getInterviewByApplication(Long internshipOfferID, Long studentID) {
        internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        StudentApplication studentApplication = studentApplicationDAO.findBy(internshipOfferID, null, null, null)
            .stream()
            .filter(app -> app.getStudent().getId().equals(studentID))
            .findFirst()
            .orElseThrow();
        return interviewDAO.findByStudentApplication(studentApplication).map(InterviewDTO::fromEntity);
    }
}
