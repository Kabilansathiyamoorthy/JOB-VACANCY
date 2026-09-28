package com.velaiconnect.controller;

import com.velaiconnect.dto.ApiResponse;
import com.velaiconnect.dto.PageResponse;
import com.velaiconnect.model.ApplicationStatus;
import com.velaiconnect.model.UserRole;
import com.velaiconnect.security.CurrentUser;
import com.velaiconnect.service.ApplicationService;
import com.velaiconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserService userService;
    private final com.velaiconnect.service.StorageService storageService;

    /** Job seeker applies (optionally with a fresh resume upload). */
    @PostMapping(value = "/jobs/{jobId}/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> apply(
            @PathVariable String jobId,
            @RequestPart(value = "resume", required = false) MultipartFile resume,
            @RequestParam(value = "coverNote", required = false) String coverNote) {

        CurrentUser.requireRole(UserRole.JOB_SEEKER);
        String resumeUrl = null;
        if (resume != null && !resume.isEmpty()) {
            resumeUrl = storageService.uploadResume(resume, CurrentUser.getId());
        }
        applicationService.apply(UUID.fromString(jobId), coverNote, resumeUrl);
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Application submitted successfully",
                "விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது"));
    }

    /** Simpler JSON apply without file. */
    @PostMapping("/jobs/{jobId}/apply-json")
    public ResponseEntity<ApiResponse<Void>> applyJson(
            @PathVariable String jobId,
            @RequestBody(required = false) Map<String, String> body) {

        CurrentUser.requireRole(UserRole.JOB_SEEKER);
        String coverNote = body == null ? null : body.get("coverNote");
        applicationService.apply(UUID.fromString(jobId), coverNote, null);
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Application submitted successfully",
                "விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது"));
    }

    @GetMapping("/applications/my")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationService.ApplicationView>>> myApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.myApplications(page, size), null, null));
    }

    @GetMapping("/employer/applicants")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationService.ApplicationView>>> applicants(
            @RequestParam(required = false) String jobId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var employer = userService.requireEmployer();
        PageResponse<ApplicationService.ApplicationView> result;
        if (jobId != null && !jobId.isBlank()) {
            result = applicationService.applicantsForJob(UUID.fromString(jobId), page, size);
        } else {
            result = applicationService.applicantsForEmployer(employer.getId(), status, page, size);
        }
        return ResponseEntity.ok(ApiResponse.ok(result, null, null));
    }

    @PatchMapping("/employer/applications/{id}/status")
    public ResponseEntity<ApiResponse<ApplicationService.ApplicationView>> updateStatus(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        ApplicationStatus status = ApplicationStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok(
                applicationService.updateStatus(UUID.fromString(id), status),
                "Status updated", "நிலை புதுப்பிக்கப்பட்டது"));
    }

    @GetMapping("/employer/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> stats() {
        var employer = userService.requireEmployer();
        return ResponseEntity.ok(ApiResponse.ok(applicationService.employerStats(employer.getId()), null, null));
    }
}
