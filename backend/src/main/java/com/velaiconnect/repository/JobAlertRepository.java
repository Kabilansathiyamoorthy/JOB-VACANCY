package com.velaiconnect.repository;

import com.velaiconnect.model.JobAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobAlertRepository extends JpaRepository<JobAlert, UUID> {
    List<JobAlert> findByJobSeekerIdAndIsActiveTrue(UUID jobSeekerId);
    List<JobAlert> findAllByIsActiveTrue();
}
