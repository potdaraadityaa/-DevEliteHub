package com.develitehub.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

/**
 * AWS S3 service for secure file upload and presigned URL generation.
 * Used by posts to attach files (PDFs, code archives, etc.)
 */
@Service
@Slf4j
public class S3Service {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.presigned-url-expiration-minutes:60}")
    private long presignedUrlExpirationMinutes;

    @Value("${aws.access-key:}")
    private String accessKey;

    @Value("${aws.secret-key:}")
    private String secretKey;

    private S3Client s3Client;
    private S3Presigner presigner;

    @PostConstruct
    public void init() {
        if (accessKey.isBlank() || secretKey.isBlank()) {
            log.warn("AWS credentials not configured – S3Service running in stub mode");
            return;
        }
        var credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
        var reg = Region.of(region);

        s3Client = S3Client.builder()
                .region(reg)
                .credentialsProvider(credentials)
                .build();

        presigner = S3Presigner.builder()
                .region(reg)
                .credentialsProvider(credentials)
                .build();

        log.info("S3Service initialized for bucket: {}", bucketName);
    }

    // ── Upload ────────────────────────────────────────────────────────

    /**
     * Uploads a file to S3 under prefix {postId}/{uuid}-{originalName}.
     * 
     * @return S3 object key
     */
    public String uploadFile(MultipartFile file, Long postId) {
        if (s3Client == null)
            throw new RuntimeException("S3 not configured");

        String key = buildKey(postId, file.getOriginalFilename());
        try {
            PutObjectRequest req = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();
            s3Client.putObject(req, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Uploaded file to S3: {}", key);
            return key;
        } catch (IOException | S3Exception e) {
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }
    }

    // ── Presigned URL ─────────────────────────────────────────────────

    public String generatePresignedUrl(String key) {
        if (presigner == null || key == null)
            return null;
        try {
            GetObjectPresignRequest presignReq = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(presignedUrlExpirationMinutes))
                    .getObjectRequest(GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build())
                    .build();
            return presigner.presignGetObject(presignReq).url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for key {}: {}", key, e.getMessage());
            return null;
        }
    }

    // ── Delete ────────────────────────────────────────────────────────

    public void deleteFile(String key) {
        if (s3Client == null || key == null)
            return;
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName).key(key).build());
            log.info("Deleted S3 object: {}", key);
        } catch (S3Exception e) {
            log.error("Failed to delete S3 object {}: {}", key, e.getMessage());
        }
    }

    // ── Helper ────────────────────────────────────────────────────────

    private String buildKey(Long postId, String originalFilename) {
        String safeName = (originalFilename != null)
                ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_")
                : "file";
        return "posts/" + postId + "/" + UUID.randomUUID() + "-" + safeName;
    }
}
