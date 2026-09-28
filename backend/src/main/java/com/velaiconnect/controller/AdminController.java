package com.velaiconnect.controller;

import com.velaiconnect.dto.AdminDtos;
import com.velaiconnect.dto.ApiResponse;
import com.velaiconnect.dto.PageResponse;
import com.velaiconnect.model.UserRole;
import com.velaiconnect.security.CurrentUser;
import com.velaiconnect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    private void requireAdmin() {
        CurrentUser.requireRole(UserRole.ADMIN);
    }

    // ---------- stats ----------
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDtos.StatsView>> stats() {
        requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok(adminService.stats(), null, null));
    }

    // ---------- users ----------
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<AdminDtos.UserAdminView>>> users(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.of(adminService.users(role, page, size)), null, null));
    }

    @PatchMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @PathVariable String id, @RequestBody AdminDtos.BlockRequest req) {
        requireAdmin();
        adminService.setUserActive(UUID.fromString(id), req.isActive());
        return ResponseEntity.ok(ApiResponse.ok(null,
                req.isActive() ? "User unblocked" : "User blocked",
                req.isActive() ? "பயனர் தடைநீக்கம் செய்யப்பட்டார்" : "பயனர் தடை செய்யப்பட்டார்"));
    }

    // ---------- jobs moderation ----------
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<PageResponse<AdminDtos.JobAdminView>>> jobs(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.of(adminService.jobs(status, page, size)), null, null));
    }

    @PatchMapping("/jobs/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveJob(@PathVariable String id) {
        requireAdmin();
        adminService.approveJob(UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Job approved", "வேலை அனுமதிக்கப்பட்டது"));
    }

    @PatchMapping("/jobs/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectJob(
            @PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        requireAdmin();
        adminService.rejectJob(UUID.fromString(id), body == null ? null : body.get("reason"));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Job rejected", "வேலை நிராகரிக்கப்பட்டது"));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> removeJob(@PathVariable String id) {
        requireAdmin();
        adminService.removeJob(UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Job removed", "வேலை நீக்கப்பட்டது"));
    }

    // ---------- employer verification ----------
    @GetMapping("/verifications")
    public ResponseEntity<ApiResponse<java.util.List<AdminDtos.VerificationView>>> verifications(
            @RequestParam(required = false) String status) {
        requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok(adminService.verifications(status), null, null));
    }

    @PatchMapping("/verifications/{id}/review")
    public ResponseEntity<ApiResponse<Void>> reviewVerification(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        requireAdmin();
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        String notes = (String) body.get("notes");
        adminService.reviewVerification(UUID.fromString(id), approve, notes);
        return ResponseEntity.ok(ApiResponse.ok(null,
                approve ? "Employer verified" : "Verification rejected",
                approve ? "முதலாளி சரிபார்க்கப்பட்டார்" : "சரிபார்ப்பு நிராகரிக்கப்பட்டது"));
    }

    // ---------- reports ----------
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<java.util.List<AdminDtos.ReportView>>> reports(
            @RequestParam(required = false) String status) {
        requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok(adminService.reports(status), null, null));
    }

    @PatchMapping("/reports/{id}")
    public ResponseEntity<ApiResponse<Void>> actOnReport(
            @PathVariable String id, @RequestBody AdminDtos.ReportActionRequest req) {
        requireAdmin();
        adminService.actOnReport(UUID.fromString(id), req.getStatus(),
                "REMOVE_JOB".equals(req.getAction()));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Report updated", "புகார் புதுப்பிக்கப்பட்டது"));
    }

    // ---------- categories ----------
    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Object>> createCategory(
            @RequestBody AdminDtos.CategoryRequest req) {
        requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok(adminService.createCategory(req),
                "Category created", "வகை உருவாக்கப்பட்டது"));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        requireAdmin();
        adminService.deleteCategory(UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Category deleted", "வகை நீக்கப்பட்டது"));
    }

    // ---------- translations ----------
    @GetMapping("/translations")
    public ResponseEntity<ApiResponse<java.util.List<Object>>> translations(
            @RequestParam(defaultValue = "ta") String locale) {
        requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok(
                adminService.translations(locale).stream().map(t -> (Object) t).toList(), null, null));
    }

    @PutMapping("/translations")
    public ResponseEntity<ApiResponse<Object>> upsertTranslation(
            @RequestBody AdminDtos.TranslationRequest req) {
        requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok(adminService.upsertTranslation(req),
                "Translation saved", "மொழிபெயர்ப்பு சேமிக்கப்பட்டது"));
    }

    // ---------- broadcast ----------
    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<Void>> broadcast(@RequestBody AdminDtos.BroadcastRequest req) {
        requireAdmin();
        adminService.broadcast(req);
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Notification sent", "அறிவிப்பு அனுப்பப்பட்டது"));
    }
}
