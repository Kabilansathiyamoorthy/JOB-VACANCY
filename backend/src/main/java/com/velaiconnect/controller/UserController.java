package com.velaiconnect.controller;

import com.velaiconnect.dto.ApiResponse;
import com.velaiconnect.dto.UserDtos;
import com.velaiconnect.model.User;
import com.velaiconnect.model.UserRole;
import com.velaiconnect.security.CurrentUser;
import com.velaiconnect.service.JobAlertService;
import com.velaiconnect.service.ReportService;
import com.velaiconnect.service.SavedJobService;
import com.velaiconnect.service.StorageService;
import com.velaiconnect.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final StorageService storageService;
    private final SavedJobService savedJobService;
    private final JobAlertService jobAlertService;
    private final ReportService reportService;
    private final com.velaiconnect.repository.DeviceTokenRepository deviceTokenRepository;

    // ---------- registration completion ----------
    @PostMapping("/register/job-seeker")
    public ResponseEntity<ApiResponse<UserDtos.JobSeekerProfile>> registerJobSeeker(
            @Valid @RequestBody UserDtos.RegisterJobSeekerRequest req) {
        CurrentUser.requireRole(UserRole.JOB_SEEKER);
        return ResponseEntity.ok(ApiResponse.ok(userService.registerJobSeeker(CurrentUser.getId(), req),
                "Registration complete", "பதிவு முடிந்தது"));
    }

    @PostMapping("/register/employer")
    public ResponseEntity<ApiResponse<UserDtos.EmployerProfile>> registerEmployer(
            @Valid @RequestBody UserDtos.RegisterEmployerRequest req) {
        CurrentUser.requireRole(UserRole.EMPLOYER);
        return ResponseEntity.ok(ApiResponse.ok(userService.registerEmployer(CurrentUser.getId(), req),
                "Registration complete", "பதிவு முடிந்தது"));
    }

    // ---------- profiles ----------
    @GetMapping("/me/job-seeker")
    public ResponseEntity<ApiResponse<UserDtos.JobSeekerProfile>> jobSeekerProfile() {
        CurrentUser.requireRole(UserRole.JOB_SEEKER);
        return ResponseEntity.ok(ApiResponse.ok(userService.getJobSeekerProfile(CurrentUser.getId()),
                null, null));
    }

    @GetMapping("/me/employer")
    public ResponseEntity<ApiResponse<UserDtos.EmployerProfile>> employerProfile() {
        CurrentUser.requireRole(UserRole.EMPLOYER);
        return ResponseEntity.ok(ApiResponse.ok(userService.getEmployerProfile(CurrentUser.getId()),
                null, null));
    }

    @PutMapping("/me/job-seeker")
    public ResponseEntity<ApiResponse<UserDtos.JobSeekerProfile>> updateJobSeeker(
            @Valid @RequestBody UserDtos.UpdateJobSeekerProfileRequest req) {
        CurrentUser.requireRole(UserRole.JOB_SEEKER);
        return ResponseEntity.ok(ApiResponse.ok(userService.updateJobSeekerProfile(CurrentUser.getId(), req),
                "Profile updated", "சுயவிவரம் புதுப்பிக்கப்பட்டது"));
    }

    @PutMapping("/me/employer")
    public ResponseEntity<ApiResponse<UserDtos.EmployerProfile>> updateEmployer(
            @Valid @RequestBody UserDtos.UpdateEmployerProfileRequest req) {
        CurrentUser.requireRole(UserRole.EMPLOYER);
        return ResponseEntity.ok(ApiResponse.ok(userService.updateEmployerProfile(CurrentUser.getId(), req),
                "Profile updated", "சுயவிவரம் புதுப்பிக்கப்பட்டது"));
    }

    // ---------- uploads ----------
    @PostMapping(value = "/me/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadResume(
            @RequestParam("file") MultipartFile file) {
        CurrentUser.requireRole(UserRole.JOB_SEEKER);
        String url = storageService.uploadResume(file, CurrentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url),
                "Resume uploaded", "ரெசியூம் பதிவேற்றப்பட்டது"));
    }

    @PostMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(
            @RequestParam("file") MultipartFile file) {
        String url = storageService.uploadProfileImage(file, CurrentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url),
                "Photo uploaded", "படம் பதிவேற்றப்பட்டது"));
    }

    @PostMapping(value = "/me/company-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadCompanyLogo(
            @RequestParam("file") MultipartFile file) {
        CurrentUser.requireRole(UserRole.EMPLOYER);
        String url = storageService.uploadCompanyLogo(file, CurrentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url),
                "Logo uploaded", "லோகோ பதிவேற்றப்பட்டது"));
    }

    // ---------- saved jobs ----------
    @PostMapping("/saved-jobs/{jobId}/toggle")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleSavedJob(@PathVariable String jobId) {
        boolean saved = savedJobService.toggle(UUID.fromString(jobId));
        return ResponseEntity.ok(ApiResponse.ok(Map.of("saved", saved),
                saved ? "Job saved" : "Job removed from saved",
                saved ? "வேலை சேமிக்கப்பட்டது" : "வேலை சேமிப்பிலிருந்து நீக்கப்பட்டது"));
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<ApiResponse<List<com.velaiconnect.dto.JobDtos.JobResponse>>> savedJobs() {
        return ResponseEntity.ok(ApiResponse.ok(savedJobService.mySavedJobs(), null, null));
    }

    // ---------- job alerts ----------
    @GetMapping("/job-alerts")
    public ResponseEntity<ApiResponse<List<com.velaiconnect.model.JobAlert>>> myAlerts() {
        return ResponseEntity.ok(ApiResponse.ok(jobAlertService.myAlerts(), null, null));
    }

    @PostMapping("/job-alerts")
    public ResponseEntity<ApiResponse<com.velaiconnect.model.JobAlert>> createAlert(
            @RequestBody UserDtos.JobAlertRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(jobAlertService.create(req),
                "Job alert created", "வேலை அலர்ட் உருவாக்கப்பட்டது"));
    }

    @DeleteMapping("/job-alerts/{alertId}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(@PathVariable String alertId) {
        jobAlertService.delete(UUID.fromString(alertId));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Job alert removed", "வேலை அலர்ட் நீக்கப்பட்டது"));
    }

    // ---------- reports (safety) ----------
    @PostMapping("/reports")
    public ResponseEntity<ApiResponse<Void>> reportJob(@Valid @RequestBody UserDtos.ReportRequest req) {
        reportService.reportJob(req);
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Report submitted. Thank you for keeping VelaiConnect safe",
                "புகார் அனுப்பப்பட்டது. VelaiConnect-ஐ பாதுகாப்பாக வைக்க உதவியதற்கு நன்றி"));
    }

    // ---------- device token (FCM) ----------
    @PostMapping("/device-token")
    public ResponseEntity<ApiResponse<Void>> registerDeviceToken(
            @RequestBody UserDtos.DeviceTokenRequest req) {
        User user = CurrentUser.get();
        var existing = deviceTokenRepository.findByFcmToken(req.getFcmToken());
        if (existing.isEmpty()) {
            deviceTokenRepository.save(com.velaiconnect.model.DeviceToken.builder()
                    .user(user)
                    .fcmToken(req.getFcmToken())
                    .platform(req.getPlatform() == null ? "android" : req.getPlatform())
                    .build());
        }
        return ResponseEntity.ok(ApiResponse.ok(null, null, null));
    }
}
