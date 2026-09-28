package com.velaiconnect.service;

import com.velaiconnect.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Uploads files to Supabase Storage via its S3-compatible API.
 * Buckets: resumes, profile-images, company-logos, verification-docs.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_DOC_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    @Value("${app.supabase.url}") private String supabaseUrl;

    public String uploadResume(MultipartFile file, UUID userId)   { return upload(file, "resumes", userId, ALLOWED_DOC_TYPES, 10 * 1024 * 1024); }
    public String uploadProfileImage(MultipartFile file, UUID userId) { return upload(file, "profile-images", userId, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024); }
    public String uploadCompanyLogo(MultipartFile file, UUID userId)  { return upload(file, "company-logos", userId, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024); }
    public String uploadVerificationDoc(MultipartFile file, UUID userId) { return upload(file, "verification-docs", userId, ALLOWED_DOC_TYPES, 10 * 1024 * 1024); }

    private String upload(MultipartFile file, String bucket, UUID userId,
                          Set<String> allowedTypes, long maxBytes) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("Please select a file", "ஒரு கோப்பைத் தேர்ந்தெடுக்கவும்");
        }
        if (file.getSize() > maxBytes) {
            throw new ApiException("File is too large (max " + (maxBytes / (1024 * 1024)) + " MB)",
                    "கோப்பு மிக அதிக அளவில் உள்ளது");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!allowedTypes.contains(contentType)) {
            throw new ApiException("File type not allowed", "இந்த கோப்பு வகை அனுமதிக்கப்படவில்லை");
        }

        String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String ext = original.contains(".")
                ? original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT) : "";
        String key = userId + "/" + UUID.randomUUID() + ext;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (Exception e) {
            log.error("Storage upload failed: {}", e.getMessage());
            throw new ApiException("Upload failed. Please try again",
                    "பதிவேற்றம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்", e);
        }

        // public buckets are readable via the standard storage URL
        boolean publicBucket = !"verification-docs".equals(bucket);
        if (publicBucket) {
            return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + key;
        }
        return bucket + "/" + key;   // private bucket: serve through backend later
    }
}
