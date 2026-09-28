package com.velaiconnect.controller;

import com.velaiconnect.dto.ApiResponse;
import com.velaiconnect.dto.JobDtos;
import com.velaiconnect.dto.PageResponse;
import com.velaiconnect.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final com.velaiconnect.repository.JobCategoryRepository categoryRepository;

    // ---------- PUBLIC endpoints ----------
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobDtos.JobResponse>>> search(
            JobDtos.JobSearchRequest params,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = jobService.search(params, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(result), null, null));
    }

    @GetMapping("/jobs/latest")
    public ResponseEntity<ApiResponse<List<JobDtos.JobResponse>>> latest(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.latest(limit), null, null));
    }

    @GetMapping("/jobs/quick")
    public ResponseEntity<ApiResponse<List<JobDtos.JobResponse>>> quickJobs() {
        return ResponseEntity.ok(ApiResponse.ok(jobService.quickJobs(), null, null));
    }

    @GetMapping("/jobs/recommended")
    public ResponseEntity<ApiResponse<List<JobDtos.JobResponse>>> recommended() {
        return ResponseEntity.ok(ApiResponse.ok(jobService.recommended(), null, null));
    }

    @GetMapping("/jobs/nearby")
    public ResponseEntity<ApiResponse<List<JobDtos.JobResponse>>> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radiusKm) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.jobsNear(lat, lng, radiusKm), null, null));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<JobDtos.JobResponse>> details(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.details(java.util.UUID.fromString(id)), null, null));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<com.velaiconnect.model.JobCategory>>> categories() {
        return ResponseEntity.ok(ApiResponse.ok(
                categoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc(), null, null));
    }

    // ---------- EMPLOYER endpoints ----------
    @PostMapping("/employer/jobs")
    public ResponseEntity<ApiResponse<JobDtos.JobResponse>> postJob(
            @Valid @RequestBody JobDtos.PostJobRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.postJob(req),
                "Job posted. Waiting for admin approval",
                "வேலை இடுப்பட்டது. நிர்வாக அனுமதிக்காக காத்திருக்கிறது"));
    }

    @PutMapping("/employer/jobs/{id}")
    public ResponseEntity<ApiResponse<JobDtos.JobResponse>> editJob(
            @PathVariable String id, @Valid @RequestBody JobDtos.PostJobRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.editJob(java.util.UUID.fromString(id), req),
                "Job updated. Waiting for admin approval",
                "வேலை புதுப்பிக்கப்பட்டது. நிர்வாக அனுமதிக்காக காத்திருக்கிறது"));
    }

    @PatchMapping("/employer/jobs/{id}/close")
    public ResponseEntity<ApiResponse<Void>> closeJob(@PathVariable String id) {
        jobService.closeJob(java.util.UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Job closed", "வேலை மூடப்பட்டது"));
    }

    @DeleteMapping("/employer/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable String id) {
        jobService.deleteJob(java.util.UUID.fromString(id));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Job deleted", "வேலை நீக்கப்பட்டது"));
    }

    @GetMapping("/employer/jobs")
    public ResponseEntity<ApiResponse<List<JobDtos.JobResponse>>> myJobs() {
        return ResponseEntity.ok(ApiResponse.ok(jobService.myEmployerJobs(), null, null));
    }
}
