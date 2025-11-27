package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.InternAssessmentDAO;
import cal.ose.internose.modele.SiteAssessment;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.ProfessorDAO;
import cal.ose.internose.service.DTOs.InternAssessmentDTO;
import cal.ose.internose.persistance.SiteAssessmentDAO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.DTOs.SiteAssessmentDTO;
import cal.ose.internose.service.exceptions.ForbiddenException;
import cal.ose.internose.utilities.SessionUtil;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class ProfessorService {
    private final InternshipContractDAO internshipContractDAO;
    private final ProfessorDAO professorDAO;
    private final SiteAssessmentDAO siteAssessmentDAO;
    private final InternAssessmentDAO internAssessmentDAO;

    public List<InternshipContractDTO> findInternshipContractsBy(long professorId, String studentName, String company, String internshipProgram, String sortBy) throws ForbiddenException {
        Professor professor = professorDAO.findById(professorId).orElseThrow();
        isLoggedProfessor(professor);

        String currentSession = SessionUtil.getCurrentSession();

        String studentNameFilter = studentName == null ? null : "%" + studentName + "%";
        String companyFilter = company == null ? null : "%" + company + "%";
        String internshipProgramFilter = internshipProgram == null ? null : "%" + internshipProgram + "%";

        List<InternshipContract> internshipContracts = internshipContractDAO
                .findAllByProfessorWithOptionalFilters(professor, currentSession, studentNameFilter, companyFilter, internshipProgramFilter);

        sortBy = sortBy == null ? "" : sortBy.toLowerCase();

        if (sortBy.equals("student")) {
            internshipContracts = internshipContracts.stream().sorted(Comparator.comparing(
                (internshipContract -> {
                    Student student = internshipContract.getStudent();
                    if (student == null) {
                        return "";
                    } else {
                        return student.getFirstName() + " " + student.getLastName();
                    }
                })
            )).toList();
        } else if (sortBy.equals("company")) {
            internshipContracts = internshipContracts.stream().sorted(Comparator.comparing(
                (internshipContract -> {
                    Employer employer = internshipContract.getEmployer();
                    if (employer == null) {
                        return "";
                    } else {
                        return employer.getCompany();
                    }
                })
            )).toList();
        } else {
            internshipContracts = internshipContracts.stream().sorted(Comparator.comparing(
                (internshipContract -> {
                    InternshipOffer internshipOffer =  internshipContract.getInternshipOffer();
                    if (internshipOffer == null) {
                        return "";
                    } else {
                        return internshipOffer.getProgram();
                    }
                })
            )).toList();
        }

        return internshipContracts.stream().map(InternshipContractDTO::fromEntity).toList();
    }

    public SiteAssessmentDTO findSiteAssessment(Long professorID, Long internshipContractID) throws ForbiddenException {
        InternshipContract internshipContract = internshipContractDAO.findById(internshipContractID)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé"));
        isAssignedToContract(professorID, internshipContract);

        SiteAssessment siteAssessment = siteAssessmentDAO.findByInternshipContract(internshipContract);
        if (siteAssessment == null) {
            // Retourne null afin que le frontend puisse afficher le formulaire
            return null;
        }

        return SiteAssessmentDTO.fromEntity(siteAssessment);
    }

    public void isAssignedToContract(Long professorID, InternshipContract contract) throws ForbiddenException {
        Professor professor = professorDAO.findById(professorID)
            .orElseThrow(() -> new NoSuchElementException("Professeur non trouvé"));

        if (contract.getProfessor() == null || !contract.getProfessor().equals(professor)) {
            throw new ForbiddenException("Vous n'êtes pas le professeur responsable de ce contrat de stage!");
        }
    }


    public SiteAssessmentDTO saveSiteAssessment(
        Long professorID, Long internshipContractID, SiteAssessmentDTO siteAssessmentDTO
    ) throws ForbiddenException {
        InternshipContract internshipContract = internshipContractDAO.findById(internshipContractID)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé"));
        isProfessorOfInternshipContract(professorID, internshipContract);

        Optional<SiteAssessment> optionalSiteAssessment = Optional.ofNullable(siteAssessmentDAO.findByInternshipContract(internshipContract));
        if (optionalSiteAssessment.isPresent())
            throw new ForbiddenException("Vous ne pouvez pas modifier une évaluation du milieu de stage");

        SiteAssessment siteAssessment = SiteAssessment.fromDTO(siteAssessmentDTO);
        siteAssessment.setInternshipContract(internshipContract);
        siteAssessment = siteAssessmentDAO.save(siteAssessment);
        return SiteAssessmentDTO.fromEntity(siteAssessment);
    }

    public void isProfessorOfInternshipContract(Long professorID, InternshipContract internshipContract) throws ForbiddenException {
        if (internshipContract.getProfessor() == null || !professorID.equals(internshipContract.getProfessor().getId()))
            throw new ForbiddenException("Vous n'êtes pas le professeur responsable de ce contrat de stage!");
    }

    public InternAssessmentDTO findInternAssessment(long contractId) throws ForbiddenException {
        InternshipContract internshipContract =  internshipContractDAO.findById(contractId).orElseThrow();
        Professor professor = internshipContract.getProfessor();

        isLoggedProfessor(professor);

        InternAssessment internAssessment = internAssessmentDAO.findByInternshipContract(internshipContract);

        if (internAssessment == null) {
            throw new NoSuchElementException();
        }

        return InternAssessmentDTO.fromEntity(internAssessment);
    }

    private void isLoggedProfessor(Professor professor) throws ForbiddenException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = (String) authentication.getPrincipal();

            if (!email.equals(professor.getEmail())) {
                throw new ForbiddenException("Vous n'êtes pas autorisé à accéder à cette ressource");
            }
            return; // allowed
        }

        throw new ForbiddenException("Vous n'êtes pas autorisé à accéder à cette ressource");
    }
}
