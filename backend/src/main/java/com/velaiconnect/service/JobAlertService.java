package com.velaiconnect.service;

import com.velaiconnect.dto.UserDtos;
import com.velaiconnect.exception.ApiException;
import com.velaiconnect.model.JobAlert;
import com.velaiconnect.model.JobCategory;
import com.velaiconnect.model.JobSeeker;
import com.velaiconnect.model.JobType;
import com.velaiconnect.repository.JobAlertRepository;
import com.velaiconnect.repository.JobCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobAlertService {

    private final JobAlertRepository jobAlertRepository;
    private final JobCategoryRepository categoryRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<JobAlert> myAlerts() {
        JobSeeker seeker = userService.requireJobSeeker();
        return jobAlertRepository.findByJobSeekerIdAndIsActiveTrue(seeker.getId());
    }

    @Transactional
    public JobAlert create(UserDtos.JobAlertRequest req) {
        JobSeeker seeker = userService.requireJobSeeker();

        JobCategory category = req.getCategoryCode() == null ? null :
                categoryRepository.findByCode(req.getCategoryCode()).orElse(null);

        JobAlert alert = JobAlert.builder()
                .jobSeeker(seeker)
                .category(category)
                .locationCity(req.getLocationCity())
                .minSalary(req.getMinSalary())
                .jobType(req.getJobType() == null ? null : JobType.valueOf(req.getJobType()))
                .isActive(true)
                .build();

        try {
            return jobAlertRepository.save(alert);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ApiException("This alert already exists", "இந்த அலர்ட் ஏற்கனவே உள்ளது");
        }
    }

    @Transactional
    public void delete(UUID alertId) {
        JobSeeker seeker = userService.requireJobSeeker();
        JobAlert alert = jobAlertRepository.findById(alertId)
                .orElseThrow(() -> new ApiException("Alert not found", "அலர்ட் கிடைக்கவில்லை"));
        if (!alert.getJobSeeker().getId().equals(seeker.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not your alert");
        }
        alert.setActive(false);
        jobAlertRepository.save(alert);
    }
}
