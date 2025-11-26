package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipContract;
import cal.ose.internose.modele.Professor;
import cal.ose.internose.modele.SiteAssessment;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.ProfessorDAO;
import cal.ose.internose.persistance.SiteAssessmentDAO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.DTOs.SiteAssessmentDTO;
import cal.ose.internose.service.exceptions.ForbiddenException;
import cal.ose.internose.utilities.SessionUtil;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

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

    public List<InternshipContractDTO> findInternshipContracts(long professorId) {
        Professor professor = professorDAO.findById(professorId).orElseThrow();
        String currentSession = SessionUtil.getCurrentSession();

        List<InternshipContract> internshipContracts = internshipContractDAO
                .findByProfessorAndSession(professor, currentSession);

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
}
