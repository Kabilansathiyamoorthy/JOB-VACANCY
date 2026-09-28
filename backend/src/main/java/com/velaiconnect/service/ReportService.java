package com.velaiconnect.service;

import com.velaiconnect.dto.UserDtos;
import com.velaiconnect.exception.ApiException;
import com.velaiconnect.model.Job;
import com.velaiconnect.model.Report;
import com.velaiconnect.model.ReportReason;
import com.velaiconnect.model.User;
import com.velaiconnect.repository.JobRepository;
import com.velaiconnect.repository.ReportRepository;
import com.velaiconnect.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final JobRepository jobRepository;

    @Transactional
    public Report reportJob(UserDtos.ReportRequest req) {
        User user = CurrentUser.get();

        Job job = jobRepository.findById(UUID.fromString(req.getJobId()))
                .orElseThrow(() -> new ApiException("Job not found", "வேலை கிடைக்கவில்லை"));

        Report report = Report.builder()
                .job(job)
                .reportedBy(user)
                .reason(ReportReason.valueOf(req.getReason()))
                .details(req.getDetails())
                .build();
        return reportRepository.save(report);
    }
}
