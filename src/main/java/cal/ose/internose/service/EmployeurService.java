package cal.ose.internose.service;

import cal.ose.internose.dao.EmployeurDAO;
import cal.ose.internose.modele.Employeur;
import cal.ose.internose.service.dto.EmployeurDTO;
import cal.ose.internose.service.exception.ChampObligatoireException;
import cal.ose.internose.service.exception.EmailDejaExistantException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmployeurService {
    private EmployeurDAO employeurDAO;

    @Transactional
    public void creerEmployeur(EmployeurDTO employeurDTO) {
        try {
            employeurDAO.save(Employeur
                    .builder()
                    .nom(employeurDTO.getNom())
                    .prenom(employeurDTO.getPrenom())
                    .email(employeurDTO.getEmail())
                    .entreprise(employeurDTO.getEntreprise())
                    .build()
            );
        }
        catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("unique constraint")) {
                throw new EmailDejaExistantException("L'adresse e-mail \"" + employeurDTO.getEmail() + "\" existe déjà.");
            }
            if (e.getMessage().contains("not-null")) {
                throw new ChampObligatoireException("Il y a des champs manquants.");
            }
        }
    }

    public EmployeurDTO findEmployeur(Long id) {
        return EmployeurDTO.toDTO(employeurDAO.findById(id).get());
    }
}
