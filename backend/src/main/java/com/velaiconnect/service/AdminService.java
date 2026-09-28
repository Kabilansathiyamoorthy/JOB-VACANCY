package com.velaiconnect.service;

import com.velaiconnect.dto.AdminDtos;
import com.velaiconnect.exception.ApiException;
import com.velaiconnect.model.*;
import com.velaiconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ReportRepository reportRepository;
    private final EmployerVerificationRepository verificationRepository;
    private final JobCategoryRepository categoryRepository;
    private final TranslationRepository translationRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final EmployerRepository employerRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    // ---------- users ----------
    @Transactional(readOnly = true)
    public Page<AdminDtos.UserAdminView> users(String role, int page, int size) {
        Page<User> p;
        if (role != null && !role.isBlank()) {
            p = userRepository.findByRole(UserRole.valueOf(role),
                    PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        } else {
            p = userRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        }
        return p.map(this::toUserView);
    }

    @Transactional
    public void setUserActive(UUID userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", "பயனர் கிடைக்கவில்லை"));
        user.setActive(active);
        userRepository.save(user);
    }

    private AdminDtos.UserAdminView toUserView(User u) {
        String name = switch (u.getRole()) {
            case JOB_SEEKER -> jobSeekerRepository.findByUserId(u.getId())
                    .map(JobSeeker::getFullName).orElse(null);
            case EMPLOYER -> employerRepository.findByUserId(u.getId())
                    .map(e -> e.getCompany().getName()).orElse(null);
            case ADMIN -> "Admin";
        };
        return AdminDtos.UserAdminView.builder()
                .id(u.getId().toString())
                .mobileNumber(u.getMobileNumber())
                .role(u.getRole().name())
                .active(u.isActive())
                .mobileVerified(u.isMobileVerified())
                .displayName(name)
                .createdAt(u.getCreatedAt() == null ? null : u.getCreatedAt().format(ISO))
                .build();
    }

    // ---------- jobs moderation ----------
    @Transactional(readOnly = true)
    public Page<AdminDtos.JobAdminView> jobs(String status, int page, int size) {
        Page<Job> p;
        if (status != null && !status.isBlank()) {
            p = jobRepository.findByStatus(JobStatus.valueOf(status),
                    PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        } else {
            p = jobRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        }
        return p.map(j -> AdminDtos.JobAdminView.builder()
                .id(j.getId().toString())
                .title(j.getTitle())
                .companyName(j.getCompanyName())
                .city(j.getLocationCity())
                .status(j.getStatus().name())
                .employerName(j.getEmployer().getCompany().getName())
                .createdAt(j.getCreatedAt() == null ? null : j.getCreatedAt().format(ISO))
                .build());
    }

    @Transactional
    public void approveJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));
        job.setStatus(JobStatus.ACTIVE);
        jobRepository.save(job);
        notificationService.notifyUser(job.getEmployer().getUser(),
                "Job approved", "வேலை அனுமதிக்கப்பட்டது",
                job.getTitle() + " is now live", job.getTitle() + " வெளியிடப்பட்டது",
                java.util.Map.of("type", "job_approved", "jobId", job.getId().toString()));
        notificationService.notifyJobAlerts(job);
    }

    @Transactional
    public void rejectJob(UUID jobId, String reason) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));
        job.setStatus(JobStatus.REJECTED);
        jobRepository.save(job);
        notificationService.notifyUser(job.getEmployer().getUser(),
                "Job rejected", "வேலை நிராகரிக்கப்பட்டது",
                job.getTitle() + " was rejected" + (reason == null ? "" : ": " + reason),
                job.getTitle() + " நிராகரிக்கப்பட்டது",
                java.util.Map.of("type", "job_rejected", "jobId", job.getId().toString()));
    }

    @Transactional
    public void removeJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));
        job.setStatus(JobStatus.REMOVED);
        jobRepository.save(job);
    }

    // ---------- employer verification ----------
    @Transactional(readOnly = true)
    public List<AdminDtos.VerificationView> verifications(String status) {
        List<EmployerVerification> list = verificationRepository.findAll();
        return list.stream()
                .filter(v -> status == null || status.isBlank() || v.getStatus().name().equalsIgnoreCase(status))
                .map(v -> AdminDtos.VerificationView.builder()
                        .id(v.getId().toString())
                        .employerUserId(v.getEmployer().getUser().getId().toString())
                        .companyName(v.getEmployer().getCompany().getName())
                        .contactPerson(v.getEmployer().getContactPerson())
                        .mobileNumber(v.getEmployer().getUser().getMobileNumber())
                        .gstNumber(v.getGstNumber())
                        .companyRegNumber(v.getCompanyRegNumber())
                        .documentUrls(v.getDocumentUrls())
                        .mobileVerified(v.isMobileVerified())
                        .companyVerified(v.isCompanyVerified())
                        .adminVerified(v.isAdminVerified())
                        .status(v.getStatus().name())
                        .createdAt(v.getCreatedAt() == null ? null : v.getCreatedAt().format(ISO))
                        .build())
                .toList();
    }

    @Transactional
    public void reviewVerification(UUID verificationId, boolean approve, String notes) {
        EmployerVerification v = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ApiException("Verification not found", "சரிபார்ப்பு கிடைக்கவில்லை"));
        v.setStatus(approve ? VerificationStatus.APPROVED : VerificationStatus.REJECTED);
        v.setCompanyVerified(approve);
        v.setAdminVerified(approve);
        v.setAdminNotes(notes);
        v.setReviewedAt(java.time.OffsetDateTime.now());
        verificationRepository.save(v);

        Employer employer = v.getEmployer();
        employer.setVerified(approve);
        employerRepository.save(employer);

        notificationService.notifyUser(employer.getUser(),
                approve ? "Employer verified" : "Verification rejected",
                approve ? "முதலாளி சரிபார்க்கப்பட்டார்" : "சரிபார்ப்பு நிராகரிக்கப்பட்டது",
                approve ? "Your company is now a Verified Employer"
                        : "Your verification was rejected" + (notes == null ? "" : ": " + notes),
                approve ? "உங்கள் நிறுவனம் சரிபார்க்கப்பட்ட முதலாளியாக உள்ளது"
                        : "உங்கள் சரிபார்ப்பு நிராகரிக்கப்பட்டது",
                java.util.Map.of("type", "verification"));
    }

    // ---------- reports ----------
    @Transactional(readOnly = true)
    public List<AdminDtos.ReportView> reports(String status) {
        List<Report> list = (status == null || status.isBlank())
                ? reportRepository.findAllByOrderByCreatedAtDesc()
                : reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.valueOf(status));
        return list.stream().map(r -> AdminDtos.ReportView.builder()
                .id(r.getId().toString())
                .jobId(r.getJob() == null ? null : r.getJob().getId().toString())
                .jobTitle(r.getJob() == null ? null : r.getJob().getTitle())
                .reason(r.getReason().name())
                .details(r.getDetails())
                .reporterMobile(r.getReportedBy().getMobileNumber())
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt() == null ? null : r.getCreatedAt().format(ISO))
                .build()).toList();
    }

    @Transactional
    public void actOnReport(UUID reportId, String status, boolean removeJob) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ApiException("Report not found", "புகார் கிடைக்கவில்லை"));
        report.setStatus(ReportStatus.valueOf(status));
        report.setResolvedAt(java.time.OffsetDateTime.now());
        reportRepository.save(report);
        if (removeJob && report.getJob() != null) {
            removeJob(report.getJob().getId());
        }
    }

    // ---------- categories ----------
    @Transactional
    public JobCategory createCategory(AdminDtos.CategoryRequest req) {
        return categoryRepository.save(JobCategory.builder()
                .code(req.getCode())
                .nameEn(req.getNameEn())
                .nameTa(req.getNameTa())
                .icon(req.getIcon() == null ? "💼" : req.getIcon())
                .sortOrder(req.getSortOrder() == null ? 100 : req.getSortOrder())
                .isActive(true)
                .build());
    }

    @Transactional
    public void deleteCategory(UUID categoryId) {
        categoryRepository.deleteById(categoryId);
    }

    // ---------- translations ----------
    @Transactional
    public Translation upsertTranslation(AdminDtos.TranslationRequest req) {
        Translation t = translationRepository.findByKeyAndLocale(req.getKey(), req.getLocale())
                .orElseGet(() -> Translation.builder().key(req.getKey()).locale(req.getLocale()).build());
        t.setValue(req.getValue());
        return translationRepository.save(t);
    }

    @Transactional(readOnly = true)
    public List<Translation> translations(String locale) {
        return translationRepository.findByLocale(locale);
    }

    // ---------- broadcast ----------
    @Transactional
    public void broadcast(AdminDtos.BroadcastRequest req) {
        notificationService.broadcast(userRepository.findAll(), req.getTitleEn(), req.getTitleTa(),
                req.getBodyEn(), req.getBodyTa());
    }

    // ---------- stats ----------
    @Transactional(readOnly = true)
    public AdminDtos.StatsView stats() {
        return AdminDtos.StatsView.builder()
                .totalUsers(userRepository.count())
                .jobSeekers(jobSeekerRepository.count())
                .employers(employerRepository.count())
                .totalJobs(jobRepository.count())
                .activeJobs(jobRepository.countByStatus(JobStatus.ACTIVE))
                .pendingJobs(jobRepository.countByStatus(JobStatus.PENDING_APPROVAL))
                .totalApplications(applicationRepository.count())
                .openReports(reportRepository.countByStatus(ReportStatus.OPEN))
                .pendingVerifications(verificationRepository.countByStatus(VerificationStatus.PENDING))
                .build();
    }
}
