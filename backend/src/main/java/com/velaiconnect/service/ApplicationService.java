package com.velaiconnect.service;

import com.velaiconnect.dto.PageResponse;
import com.velaiconnect.exception.ApiException;
import com.velaiconnect.model.*;
import com.velaiconnect.repository.ApplicationRepository;
import com.velaiconnect.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserService userService;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    // ---------- JOB SEEKER applies ----------
    @Transactional
    public void apply(UUID jobId, String coverNote, String resumeUrl) {
        JobSeeker seeker = userService.requireJobSeeker();

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));

        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new ApiException("This job is not accepting applications",
                    "இந்த வேலை விண்ணப்பங்களை ஏற்றுக்கொள்ளவில்லை");
        }
        if (job.getApplicationDeadline() != null
                && job.getApplicationDeadline().isBefore(java.time.LocalDate.now())) {
            throw new ApiException("Application deadline has passed",
                    "விண்ணப்ப காலக்கெடு முடிந்துவிட்டது");
        }
        if (applicationRepository.existsByJobIdAndJobSeekerId(jobId, seeker.getId())) {
            throw new ApiException("You have already applied for this job",
                    "இந்த வேலைக்கு ஏற்கனவே விண்ணப்பித்துள்ளீர்கள்");
        }

        Application app = Application.builder()
                .job(job)
                .jobSeeker(seeker)
                .coverNote(coverNote)
                .resumeUrl(resumeUrl != null ? resumeUrl : seeker.getResumeUrl())
                .status(ApplicationStatus.APPLIED)
                .build();
        applicationRepository.save(app);
    }

    // ---------- JOB SEEKER: my applications ----------
    @Transactional(readOnly = true)
    public PageResponse<ApplicationView> myApplications(int page, int size) {
        JobSeeker seeker = userService.requireJobSeeker();
        Pageable pageable = PageRequest.of(page, size);
        Page<Application> p = applicationRepository
                .findByJobSeekerIdOrderByAppliedAtDesc(seeker.getId(), pageable);
        return PageResponse.of(p.map(this::toView));
    }

    // ---------- EMPLOYER: view applicants ----------
    @Transactional(readOnly = true)
    public PageResponse<ApplicationView> applicantsForEmployer(UUID employerId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Application> p;
        if (status != null && !status.isBlank()) {
            p = applicationRepository.findByJobEmployerIdAndStatusOrderByAppliedAtDesc(
                    employerId, ApplicationStatus.valueOf(status), pageable);
        } else {
            p = applicationRepository.findByJobEmployerIdOrderByAppliedAtDesc(employerId, pageable);
        }
        return PageResponse.of(p.map(this::toView));
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationView> applicantsForJob(UUID jobId, int page, int size) {
        Employer employer = userService.requireEmployer();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));
        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not your job");
        }
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.of(applicationRepository.findByJobIdOrderByAppliedAtAsc(jobId, pageable)
                .map(this::toView));
    }

    // ---------- EMPLOYER updates status ----------
    @Transactional
    public ApplicationView updateStatus(UUID applicationId, ApplicationStatus newStatus) {
        Employer employer = userService.requireEmployer();
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException("Application not found", "விண்ணப்பம் கிடைக்கவில்லை"));
        if (!app.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not your applicant");
        }
        app.setStatus(newStatus);
        applicationRepository.save(app);
        return toView(app);
    }

    // ---------- stats for employer dashboard ----------
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> employerStats(UUID employerId) {
        java.util.Map<String, Long> stats = new java.util.LinkedHashMap<>();
        for (ApplicationRepository.ApplicantCounts c : applicationRepository.countByEmployerGrouped(employerId)) {
            stats.put(c.getStatus(), c.getCount());
        }
        return stats;
    }

    // ---------- mapping ----------
    public record ApplicationView(
            String id,
            String jobId,
            String jobTitle,
            String companyName,
            String seekerName,
            String seekerMobile,
            String seekerCity,
            String seekerSkills,
            Double seekerExperienceYears,
            String resumeUrl,
            String coverNote,
            String status,
            String appliedAt) {}

    private ApplicationView toView(Application a) {
        JobSeeker s = a.getJobSeeker();
        return new ApplicationView(
                a.getId().toString(),
                a.getJob().getId().toString(),
                a.getJob().getTitle(),
                a.getJob().getCompanyName(),
                s.getFullName(),
                s.getUser().getMobileNumber(),
                s.getLocationCity(),
                s.getSkills(),
                s.getExperienceYears() == null ? 0.0 : s.getExperienceYears().doubleValue(),
                a.getResumeUrl(),
                a.getCoverNote(),
                a.getStatus().name(),
                a.getAppliedAt() == null ? null : a.getAppliedAt().format(ISO));
    }
}
