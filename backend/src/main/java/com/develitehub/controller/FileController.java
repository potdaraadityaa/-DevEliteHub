package com.develitehub.controller;

import com.develitehub.dto.response.ApiResponse;
import com.develitehub.dto.response.PostResponse;
import com.develitehub.entity.Post;
import com.develitehub.entity.User;
import com.develitehub.exception.ForbiddenException;
import com.develitehub.exception.ResourceNotFoundException;
import com.develitehub.repository.PostRepository;
import com.develitehub.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * File upload endpoint for creator posts.
 * POST /api/files/posts/{postId} – attach a file to a post (S3)
 * GET /api/files/posts/{postId} – get presigned URL for file download
 */
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final S3Service s3Service;
    private final PostRepository postRepository;

    @PostMapping(value = "/posts/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @PathVariable Long postId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User creator) {

        Post post = getOwnedPost(postId, creator);

        // Delete old file if exists
        if (post.getFileKey() != null) {
            s3Service.deleteFile(post.getFileKey());
        }

        String key = s3Service.uploadFile(file, postId);
        post.setFileKey(key);
        post.setFileName(file.getOriginalFilename());
        post.setFileType(file.getContentType());
        post.setFileSizeBytes(file.getSize());
        postRepository.save(post);

        log.info("File uploaded for post {}: {}", postId, key);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("fileKey", key, "fileName", file.getOriginalFilename()),
                "File uploaded successfully"));
    }

    @GetMapping("/posts/{postId}/url")
    public ResponseEntity<ApiResponse<Map<String, String>>> getFileUrl(
            @PathVariable Long postId,
            @AuthenticationPrincipal User requester) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", postId));

        if (post.getFileKey() == null) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(), "No file attached"));
        }

        String url = s3Service.generatePresignedUrl(post.getFileKey());
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("url", url, "fileName", post.getFileName()),
                "Presigned URL generated"));
    }

    private Post getOwnedPost(Long postId, User creator) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", postId));
        if (!post.getCreator().getId().equals(creator.getId())) {
            throw new ForbiddenException("You do not own this post");
        }
        return post;
    }
}
