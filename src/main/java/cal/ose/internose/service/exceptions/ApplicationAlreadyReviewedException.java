package cal.ose.internose.service.exceptions;

public class ApplicationAlreadyReviewedException extends RuntimeException {
    public ApplicationAlreadyReviewedException() {
        super("Cette application est déjà examinée.");
    }
}
