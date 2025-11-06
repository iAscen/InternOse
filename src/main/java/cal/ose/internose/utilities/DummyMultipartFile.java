package cal.ose.internose.utilities;

import cal.ose.internose.InternOSEApplication;
import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;

public record DummyMultipartFile(
    String name, String originalFilename, String contentType, byte[] content
) implements MultipartFile {
    public static MultipartFile createDummyResume() {
        String resumeFileName = "DummyResume.pdf";
        String resumeFileNameWithoutExtension = resumeFileName.substring(0, resumeFileName.lastIndexOf('.'));
        byte[] resumeFileData = new byte[0];

        try (InputStream inputStream = DummyMultipartFile.class.getClassLoader().getResourceAsStream(resumeFileName)) {
            if (inputStream == null) {
                InternOSEApplication.LOGGER.error("{} not found in src/main/resources", resumeFileName);

                // Retourner un fichier PDF vide
                return new DummyMultipartFile(resumeFileNameWithoutExtension, resumeFileName, "application/pdf", resumeFileData);
            }

            resumeFileData = inputStream.readAllBytes();
        } catch (IOException e) {
            InternOSEApplication.LOGGER.error("Error loading dummy resume file: ", e);
        }

        return new DummyMultipartFile(resumeFileNameWithoutExtension, resumeFileName, "application/pdf", resumeFileData);
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
    public void transferTo(@NonNull File dest) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(content);
        }
    }
}
