package com.velaiconnect.service;

import com.velaiconnect.dto.JobDtos;
import com.velaiconnect.exception.ApiException;
import com.velaiconnect.model.Job;
import com.velaiconnect.model.JobAlert;
import com.velaiconnect.model.JobCategory;
import com.velaiconnect.model.JobSeeker;
import com.velaiconnect.model.JobSkill;
import com.velaiconnect.model.JobType;
import com.velaiconnect.model.SavedJob;
import com.velaiconnect.repository.JobAlertRepository;
import com.velaiconnect.repository.JobCategoryRepository;
import com.velaiconnect.repository.JobRepository;
import com.velaiconnect.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserService userService;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    @Transactional
    public boolean toggle(UUID jobId) {
        JobSeeker seeker = userService.requireJobSeeker();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));

        var existing = savedJobRepository.findByJobSeekerIdAndJobId(seeker.getId(), jobId);
        if (existing.isPresent()) {
            savedJobRepository.delete(existing.get());
            return false;   // removed
        }
        savedJobRepository.save(SavedJob.builder().jobSeeker(seeker).job(job).build());
        return true;        // saved
    }

    @Transactional(readOnly = true)
    public List<JobDtos.JobResponse> mySavedJobs() {
        JobSeeker seeker = userService.requireJobSeeker();
        return savedJobRepository.findByJobSeekerIdOrderBySavedAtDesc(seeker.getId())
                .stream()
                .map(SavedJob::getJob)
                .map(this::toResponse)
                .toList();
    }

    private JobDtos.JobResponse toResponse(Job job) {
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
                .saved(true)
                .build();
    }
}
