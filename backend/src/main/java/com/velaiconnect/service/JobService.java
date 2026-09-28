package com.velaiconnect.service;

import com.velaiconnect.dto.JobDtos;
import com.velaiconnect.exception.ApiException;
import com.velaiconnect.model.*;
import com.velaiconnect.repository.ApplicationRepository;
import com.velaiconnect.repository.JobCategoryRepository;
import com.velaiconnect.repository.JobRepository;
import com.velaiconnect.repository.JobSeekerRepository;
import com.velaiconnect.repository.SavedJobRepository;
import com.velaiconnect.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobCategoryRepository categoryRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final UserService userService;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    // ---------- EMPLOYER: post / edit / close / delete ----------
    @Transactional
    public JobDtos.JobResponse postJob(JobDtos.PostJobRequest req) {
        Employer employer = userService.requireEmployer();
        JobCategory category = categoryRepository.findById(UUID.fromString(req.getCategoryId()))
                .orElseThrow(() -> new ApiException("Invalid category", "தவறான வகை"));

        Job job = Job.builder()
                .employer(employer)
                .category(category)
                .title(req.getTitle())
                .titleTa(req.getTitleTa())
                .description(req.getDescription())
                .descriptionTa(req.getDescriptionTa())
                .companyName(req.getCompanyName())
                .locationCity(req.getLocationCity())
                .locationArea(req.getLocationArea())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .salaryMin(req.getSalaryMin())
                .salaryMax(req.getSalaryMax())
                .salaryPeriod(SalaryPeriod.valueOf(req.getSalaryPeriod()))
                .jobType(JobType.valueOf(req.getJobType()))
                .experienceRequired(req.getExperienceRequired() == null ? "FRESHER" : req.getExperienceRequired())
                .qualification(req.getQualification())
                .vacancies(req.getVacancies())
                .contactPhone(req.getContactPhone())
                .isWorkFromHome(Boolean.TRUE.equals(req.getWorkFromHome())
                        || "WORK_FROM_HOME".equals(req.getJobType()))
                .isQuickJob(Boolean.TRUE.equals(req.getQuickJob())
                        || "DAILY_WAGE".equals(req.getJobType()))
                .status(JobStatus.PENDING_APPROVAL)
                .applicationDeadline(req.getApplicationDeadline())
                .build();

        for (String s : req.getSkills()) {
            String skill = s.trim();
            if (!skill.isEmpty()) {
                job.getSkills().add(JobSkill.builder().job(job).skill(skill).build());
            }
        }

        jobRepository.save(job);
        return toResponse(job, currentSeekerOrNull(), currentUserIdOrNull());
    }

    @Transactional
    public JobDtos.JobResponse editJob(UUID jobId, JobDtos.PostJobRequest req) {
        Employer employer = userService.requireEmployer();
        Job job = getOwnedJob(employer, jobId);

        JobCategory category = categoryRepository.findById(UUID.fromString(req.getCategoryId()))
                .orElseThrow(() -> new ApiException("Invalid category", "தவறான வகை"));

        job.setCategory(category);
        job.setTitle(req.getTitle());
        job.setTitleTa(req.getTitleTa());
        job.setDescription(req.getDescription());
        job.setDescriptionTa(req.getDescriptionTa());
        job.setCompanyName(req.getCompanyName());
        job.setLocationCity(req.getLocationCity());
        job.setLocationArea(req.getLocationArea());
        job.setLatitude(req.getLatitude());
        job.setLongitude(req.getLongitude());
        job.setSalaryMin(req.getSalaryMin());
        job.setSalaryMax(req.getSalaryMax());
        job.setSalaryPeriod(SalaryPeriod.valueOf(req.getSalaryPeriod()));
        job.setJobType(JobType.valueOf(req.getJobType()));
        job.setExperienceRequired(req.getExperienceRequired() == null ? "FRESHER" : req.getExperienceRequired());
        job.setQualification(req.getQualification());
        job.setVacancies(req.getVacancies());
        job.setContactPhone(req.getContactPhone());
        job.setWorkFromHome(Boolean.TRUE.equals(req.getWorkFromHome()) || "WORK_FROM_HOME".equals(req.getJobType()));
        job.setQuickJob(Boolean.TRUE.equals(req.getQuickJob()) || "DAILY_WAGE".equals(req.getJobType()));
        job.setApplicationDeadline(req.getApplicationDeadline());

        job.getSkills().clear();
        for (String s : req.getSkills()) {
            String skill = s.trim();
            if (!skill.isEmpty()) {
                job.getSkills().add(JobSkill.builder().job(job).skill(skill).build());
            }
        }

        // edits go back to moderation
        job.setStatus(JobStatus.PENDING_APPROVAL);
        jobRepository.save(job);
        return toResponse(job, currentSeekerOrNull(), currentUserIdOrNull());
    }

    @Transactional
    public void closeJob(UUID jobId) {
        Job job = getOwnedJob(userService.requireEmployer(), jobId);
        job.setStatus(JobStatus.CLOSED);
        jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(UUID jobId) {
        Job job = getOwnedJob(userService.requireEmployer(), jobId);
        jobRepository.delete(job);
    }

    private Job getOwnedJob(Employer employer, UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));
        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not your job");
        }
        return job;
    }

    // ---------- SEARCH with filters ----------
    @Transactional(readOnly = true)
    public Page<JobDtos.JobResponse> search(JobDtos.JobSearchRequest r, Pageable pageable) {
        Specification<Job> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));

            if (r != null) {
                if (r.getSearch() != null && !r.getSearch().isBlank()) {
                    String like = "%" + r.getSearch().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("title")), like),
                            cb.like(cb.lower(root.get("companyName")), like),
                            cb.like(cb.lower(root.get("description")), like),
                            cb.like(cb.lower(root.get("locationCity")), like)));
                }
                if (r.getCategoryCode() != null && !r.getCategoryCode().isBlank()) {
                    predicates.add(cb.equal(root.get("category").get("code"), r.getCategoryCode()));
                }
                if (r.getLocationCity() != null && !r.getLocationCity().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("locationCity")),
                            "%" + r.getLocationCity().toLowerCase() + "%"));
                }
                if (r.getJobType() != null && !r.getJobType().isBlank()) {
                    predicates.add(cb.equal(root.get("jobType"), JobType.valueOf(r.getJobType())));
                }
                if (r.getSalaryPeriod() != null && !r.getSalaryPeriod().isBlank()) {
                    predicates.add(cb.equal(root.get("salaryPeriod"), SalaryPeriod.valueOf(r.getSalaryPeriod())));
                }
                if (r.getMinSalary() != null) {
                    predicates.add(cb.or(
                            cb.isNull(root.get("salaryMax")),
                            cb.greaterThanOrEqualTo(root.get("salaryMax"), r.getMinSalary().intValue())));
                }
                if (r.getMaxSalary() != null) {
                    predicates.add(cb.or(
                            cb.isNull(root.get("salaryMin")),
                            cb.lessThanOrEqualTo(root.get("salaryMin"), r.getMaxSalary().intValue())));
                }
                if (Boolean.TRUE.equals(r.getFresherOnly())) {
                    predicates.add(cb.equal(cb.lower(root.get("experienceRequired")), "fresher"));
                }
                if (Boolean.TRUE.equals(r.getWorkFromHome())) {
                    predicates.add(cb.equal(root.get("isWorkFromHome"), true));
                }
                if (Boolean.TRUE.equals(r.getQuickJobsOnly())) {
                    predicates.add(cb.equal(root.get("isQuickJob"), true));
                }
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Job> page = jobRepository.findAll(spec, pageable);

        final JobSeeker seeker = currentSeekerOrNull();
        final UUID viewerId = currentUserIdOrNull();
        return page.map(job -> toResponse(job, seeker, viewerId));
    }

    // ---------- feeds ----------
    @Transactional(readOnly = true)
    public List<JobDtos.JobResponse> latest(int limit) {
        return jobRepository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(j -> toResponse(j, currentSeekerOrNull(), currentUserIdOrNull()))
                .getContent();
    }

    @Transactional(readOnly = true)
    public List<JobDtos.JobResponse> quickJobs() {
        return jobRepository.findTop20ByIsQuickJobTrueAndStatusOrderByCreatedAtDesc(JobStatus.ACTIVE)
                .stream()
                .map(j -> toResponse(j, currentSeekerOrNull(), currentUserIdOrNull()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<JobDtos.JobResponse> recommended() {
        JobSeeker seeker = currentSeekerOrNull();
        if (seeker == null) {
            return latest(10);
        }
        List<Job> candidates = jobRepository
                .findTop50ByStatusOrderByCreatedAtDesc(JobStatus.ACTIVE);
        return candidates.stream()
                .map(j -> toResponse(j, seeker, seeker.getUser().getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<JobDtos.JobResponse> jobsNear(Double lat, Double lng, double radiusKm) {
        JobSeeker seeker = currentSeekerOrNull();
        UUID viewerId = currentUserIdOrNull();

        return jobRepository.findTop200ByStatusOrderByCreatedAtDesc(JobStatus.ACTIVE)
                .stream()
                .filter(j -> j.getLatitude() != null && j.getLongitude() != null)
                .map(j -> new Object[]{j, distanceKm(lat, lng, j.getLatitude(), j.getLongitude())})
                .filter(arr -> (Double) arr[1] <= radiusKm)
                .sorted((a, b) -> Double.compare((Double) a[1], (Double) b[1]))
                .limit(50)
                .map(arr -> {
                    JobDtos.JobResponse resp = toResponse((Job) arr[0], seeker, viewerId);
                    resp.setDistanceKm(Math.round((Double) arr[1] * 10.0) / 10.0);
                    return resp;
                })
                .toList();
    }

    // ---------- details ----------
    @Transactional
    public JobDtos.JobResponse details(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));

        User viewer = currentUserOrNull();
        boolean ownerViewing = viewer != null
                && job.getEmployer().getUser().getId().equals(viewer.getId());

        if (job.getStatus() != JobStatus.ACTIVE && !ownerViewing) {
            throw new ApiException("Job not available", "வேலை கிடைக்கவில்லை");
        }

        jobRepository.incrementViewCount(jobId);
        JobSeeker seeker = viewer != null && viewer.getRole() == UserRole.JOB_SEEKER
                ? jobSeekerRepository.findByUserId(viewer.getId()).orElse(null) : null;
        return toResponse(job, seeker, viewer == null ? null : viewer.getId());
    }

    // ---------- EMPLOYER: my jobs ----------
    @Transactional(readOnly = true)
    public List<JobDtos.JobResponse> myEmployerJobs() {
        var employer = userService.requireEmployer();
        return jobRepository.findByEmployerIdOrderByCreatedAtDesc(employer.getId())
                .stream()
                .map(j -> toResponse(j, null, employer.getUser().getId()))
                .toList();
    }

    // ---------- helpers ----------
    private JobSeeker currentSeekerOrNull() {
        try {
            User u = CurrentUser.get();
            if (u.getRole() != UserRole.JOB_SEEKER) return null;
            return jobSeekerRepository.findByUserId(u.getId()).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private UUID currentUserIdOrNull() {
        try {
            return CurrentUser.get().getId();
        } catch (Exception e) {
            return null;
        }
    }

    private User currentUserOrNull() {
        try {
            return CurrentUser.get();
        } catch (Exception e) {
            return null;
        }
    }

    private static double distanceKm(double lat1, double lng1, double lat2, double lng2) {
        double earthKm = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private JobDtos.JobResponse toResponse(Job job, JobSeeker seeker, UUID viewerId) {
        boolean saved = seeker != null
                && savedJobRepository.existsByJobSeekerIdAndJobId(seeker.getId(), job.getId());
        boolean applied = seeker != null
                && applicationRepository.existsByJobIdAndJobSeekerId(job.getId(), seeker.getId());

        return JobDtos.JobResponse.builder()
                .id(job.getId().toString())
                .title(job.getTitle())
                .titleTa(job.getTitleTa())
                .description(job.getDescription())
                .descriptionTa(job.getDescriptionTa())
                .companyName(job.getCompanyName())
                .verifiedEmployer(job.getEmployer().isVerified())
                .categoryCode(job.getCategory().getCode())
                .categoryNameEn(job.getCategory().getNameEn())
                .categoryNameTa(job.getCategory().getNameTa())
                .categoryIcon(job.getCategory().getIcon())
                .locationCity(job.getLocationCity())
                .locationArea(job.getLocationArea())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryPeriod(job.getSalaryPeriod().name())
                .jobType(job.getJobType().name())
                .experienceRequired(job.getExperienceRequired())
                .qualification(job.getQualification())
                .skills(job.getSkills().stream().map(JobSkill::getSkill).toList())
                .vacancies(job.getVacancies())
                .workFromHome(job.isWorkFromHome())
                .quickJob(job.isQuickJob())
                .status(job.getStatus().name())
                .applicationDeadline(job.getApplicationDeadline())
                .contactPhone(job.getContactPhone())
                .postedAt(job.getCreatedAt() == null ? null : job.getCreatedAt().format(ISO))
                .viewCount(job.getViewCount())
                .saved(saved)
                .applied(applied)
                .build();
    }
}
