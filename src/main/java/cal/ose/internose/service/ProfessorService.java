package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipContract;
import cal.ose.internose.modele.Professor;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.ProfessorDAO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.utilities.SessionUtil;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class ProfessorService {
    private final InternshipContractDAO internshipContractDAO;
    private final ProfessorDAO professorDAO;

    public List<InternshipContractDTO> findInternshipContracts(long professorId) {
        Professor professor = professorDAO.findById(professorId).orElseThrow();
        String currentSession = SessionUtil.getCurrentSession();

        List<InternshipContract> internshipContracts = internshipContractDAO
                .findByProfessorAndSession(professor, currentSession);

        return internshipContracts.stream().map(InternshipContractDTO::fromEntity).toList();
    }
}
