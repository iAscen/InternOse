package cal.ose.internose.service.exceptions;

public class InternshipOfferNotApprovedException extends Exception {
    public InternshipOfferNotApprovedException() {
        super("Cette offre de stage n'a pas encore été approuvée.");
    }
}
