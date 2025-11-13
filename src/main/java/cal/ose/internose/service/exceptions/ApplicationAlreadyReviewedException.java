package cal.ose.internose.service.exceptions;

public class ApplicationAlreadyReviewedException extends Exception {
    public ApplicationAlreadyReviewedException() {
        super("Cette candidature est déjà acceptée ou refusée.");
    }
}
