package com.velaiconnect.repository;

import com.velaiconnect.model.JobSeeker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JobSeekerRepository extends JpaRepository<JobSeeker, UUID> {
    Optional<JobSeeker> findByUserId(UUID userId);
}
