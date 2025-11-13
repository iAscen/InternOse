package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.*;
import cal.ose.internose.service.DTOs.*;
import cal.ose.internose.service.exceptions.ApplicationAlreadyReviewedException;
import cal.ose.internose.service.exceptions.ForbiddenException;
import cal.ose.internose.service.exceptions.InterviewAlreadyScheduledException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class EmployerService {
    private final EmployerDAO employerDAO;
    private final InternshipOfferDAO internshipOfferDAO;
    private final StudentApplicationDAO studentApplicationDAO;
    private final InterviewDAO interviewDAO;
    private final StudentDAO studentDAO;
    private final InternshipContractDAO internshipContractDAO;
    private final InternAssessmentDAO internAssessmentDAO;

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
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        List<StudentApplication> applications = studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(
            internshipOffer, applicationStatus, institution, program
        );
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
                    .seenStatus(studentApplication.getSeenStatus())
                    .build())
            .collect(Collectors.toList());
    }

    public StudentDTO getStudentApplicationDetails(Long internshipOfferID, Long studentID) {
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        return studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(internshipOffer, null, null, null)
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
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElseThrow();

        StudentApplication studentApplication = studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(internshipOffer, null, null, null)
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
        List<Interview> interviews = interviewDAO.findAllByStudentApplicationInternshipOfferEmployer(employer);
        return InterviewDTO.fromEntityList(interviews);
    }

    public Optional<InterviewDTO> getInterviewByApplication(Long internshipOfferID, Long studentID) {
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        StudentApplication studentApplication = studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(internshipOffer, null, null, null)
            .stream()
            .filter(app -> app.getStudent().getId().equals(studentID))
            .findFirst()
            .orElseThrow();
        return interviewDAO.findByStudentApplication(studentApplication).map(InterviewDTO::fromEntity);
    }

    public StudentApplicationDTO reviewApplication(Long internshipOfferID, Long studentID, boolean approved, String rejectionReason)
        throws ApplicationAlreadyReviewedException
    {
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElseThrow();

        StudentApplication studentApplication = studentApplicationDAO.findAllByInternshipOfferWithOptionalFilters(internshipOffer, null, null, null)
            .stream()
            .filter(app -> app.getStudent().getId().equals(studentID))
            .findFirst()
            .orElseThrow();

        // Vérifier que la candidature n'a pas déjà été traitée
        StudentApplication.ApplicationStatus currentStatus = studentApplication.getApplicationStatus();
        if (currentStatus != StudentApplication.ApplicationStatus.PENDING && 
            currentStatus != StudentApplication.ApplicationStatus.PENDING_INTERVIEW) {
            throw new ApplicationAlreadyReviewedException();
        }

        if (approved) {
            studentApplication.setApplicationStatus(StudentApplication.ApplicationStatus.APPROVED);
            studentApplication.setRejectionReason(null);
        } else {
            studentApplication.setApplicationStatus(StudentApplication.ApplicationStatus.REJECTED);
            studentApplication.setRejectionReason(rejectionReason);
        }

        return StudentApplicationDTO.fromEntity(studentApplicationDAO.save(studentApplication));
    }

    public Map<String, Integer> countUnseenApplications(Long offerID) {
        int studentsWhoRejectedTheOffer = 0;
        int studentsWhoAcceptedTheOffer = 0;

        InternshipOffer internshipOffer = internshipOfferDAO.findById(offerID).orElseThrow();

        for(StudentApplication application: studentApplicationDAO.findByInternshipOffer(internshipOffer)) {
            if (application.getSeenStatus() == StudentApplication.SeenStatus.UNSEEN) {
                if (application.getApplicationStatus() == StudentApplication.ApplicationStatus.REJECTED_BY_STUDENT) {
                    studentsWhoRejectedTheOffer++;
                }

                if (application.getApplicationStatus() == StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT) {
                    studentsWhoAcceptedTheOffer++;
                }
            }
        }

        Map<String, Integer> unseenApplications = new HashMap<>();
        unseenApplications.put("studentsWhoRejectedTheOffer", studentsWhoRejectedTheOffer);
        unseenApplications.put("studentsWhoAcceptedTheOffer", studentsWhoAcceptedTheOffer);

        return unseenApplications;
    }

    public void makeApplicationsSeen(Long offerID) {
        InternshipOffer offer = internshipOfferDAO.findById(offerID).orElseThrow();

        List<StudentApplication> applications = studentApplicationDAO.findByInternshipOffer(offer);

        for (StudentApplication application: applications) {
            if ((application.getApplicationStatus() == StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT ||
                application.getApplicationStatus() == StudentApplication.ApplicationStatus.REJECTED_BY_STUDENT) &&
                application.getSeenStatus() == StudentApplication.SeenStatus.UNSEEN) {

                application.setSeenStatus(StudentApplication.SeenStatus.SEEN);
                studentApplicationDAO.save(application);
            }
        }
    }

    public InternshipContractDTO signContract(Long studentID, Long internshipOfferID, Long employerID) {
        Employer employer = employerDAO.findById(employerID)
            .orElseThrow(() -> new NoSuchElementException("Employeur non trouvé"));
        Student student = studentDAO.findById(studentID)
            .orElseThrow(() -> new NoSuchElementException("Étudiant non trouvé"));

        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID)
            .orElseThrow(() -> new NoSuchElementException("Offre de stage non trouvée"));

        InternshipContract contract = internshipContractDAO.findByStudentAndEmployerAndInternshipOffer(student, employer, internshipOffer)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé pour cet étudiant et cette offre"));

        if (contract.getIsSignedEmployer()) {
            throw new IllegalStateException("Ce contrat a déjà été signé par l'employeur");
        }

        contract.setIsSignedEmployer(true);
        internshipContractDAO.save(contract);

        return InternshipContractDTO.fromEntity(contract);
    }

    public InternshipContractDTO findContractByEmployerAndOffer(Long employerId, Long internshipOfferId, Long studentId) {
        // Vérifier que l'employeur existe
        employerDAO.findById(employerId).orElseThrow();
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferId).orElseThrow();
        Student student = studentDAO.findById(studentId).orElseThrow();

        InternshipContract contract = internshipContractDAO.findByStudentAndInternshipOffer(student, internshipOffer)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé pour cette offre et cet étudiant"));

        if (contract.getEmployer() == null || !contract.getEmployer().getId().equals(employerId)) {
            throw new NoSuchElementException("Contrat non trouvé pour cet employeur");
        }

        return InternshipContractDTO.fromEntity(contract);
    }

    public InternAssessmentDTO findInternAssessment(Long employerID, Long internshipContractID) throws ForbiddenException {
        InternshipContract internshipContract = internshipContractDAO.findById(internshipContractID)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé"));
        isOwnerOfInternshipContract(employerID, internshipContract);

        InternAssessment assessment = internAssessmentDAO.findByInternshipContract(internshipContract);
        if (assessment == null) {
            throw new NoSuchElementException("Évaluation non trouvée pour ce contrat");
        }
        return InternAssessmentDTO.fromEntity(assessment);
    }

    public InternAssessmentDTO saveInternAssessment(
        Long employerID, Long internshipContractID, InternAssessmentDTO internAssessmentDTO
    ) throws ForbiddenException {
        InternshipContract internshipContract = internshipContractDAO.findById(internshipContractID)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé"));
        isOwnerOfInternshipContract(employerID, internshipContract);

        Optional<InternAssessment> optionalInternAssessment = Optional.ofNullable(internAssessmentDAO.findByInternshipContract(internshipContract));
        if (optionalInternAssessment.isPresent())
            throw new ForbiddenException("Vous ne pouvez pas modifier une évaluation du stagiaire");

        InternAssessment internAssessment = InternAssessment.fromDTO(internAssessmentDTO);
        internAssessment.setInternshipContract(internshipContract);
        internAssessment = internAssessmentDAO.save(internAssessment);
        return InternAssessmentDTO.fromEntity(internAssessment);
    }

    public void isOwnerOfInternshipContract(Long employerID, InternshipContract internshipContract) throws ForbiddenException {
        if (!employerID.equals(internshipContract.getEmployer().getId()))
            throw new ForbiddenException("Vous n'êtes pas le propriétaire de cette entente de stage!");
    }
}
