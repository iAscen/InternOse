package cal.ose.internose.utilities;

import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;

public record DummyMultipartFile(
    String name, String originalFilename, String contentType, byte[] content
) implements MultipartFile {
    public static MultipartFile createDummyResume(String resumeFileName) {
        String resumeFileData = """
                %PDF-1.4
                1 0 obj
                << /Type /Catalog /Pages 2 0 R >>
                endobj
                2 0 obj
                << /Type /Pages /Kids [3 0 R] /Count 1 >>
                endobj
                3 0 obj
                << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
                endobj
                xref
                0 4
                0000000000 65535 f\s
                0000000010 00000 n\s
                0000000053 00000 n\s
                0000000125 00000 n\s
                trailer
                << /Size 4 /Root 1 0 R >>
                startxref
                179
                %%EOF
            """;

        return new DummyMultipartFile("dummy_resume", resumeFileName, "application/pdf", resumeFileData.getBytes());
    }

    @Override
    @NonNull
    public String getName() {
        return name;
    }

    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return content == null || content.length == 0;
    }

    @Override
    public long getSize() {
        return content != null ? content.length : 0;
    }

    @Override
    @NonNull
    public byte[] getBytes() {
        return content;
    }

    @Override
    @NonNull
    public InputStream getInputStream() {
        return new ByteArrayInputStream(content);
    }

    @Override
    public void transferTo(@NonNull File dest) {
        // transferTo is not supported for DummyMultipartFile instances
    }
}
