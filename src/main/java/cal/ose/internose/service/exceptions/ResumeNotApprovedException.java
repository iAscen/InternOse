package cal.ose.internose.service.exceptions;

public class ResumeNotApprovedException extends Exception {
    public ResumeNotApprovedException() {
        super("Vous devez avoir un CV approuvé pour postuler aux offres de stage.");
    }
}
