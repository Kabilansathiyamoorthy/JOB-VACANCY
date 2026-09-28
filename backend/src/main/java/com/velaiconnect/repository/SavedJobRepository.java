package com.velaiconnect.repository;

import com.velaiconnect.model.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    List<SavedJob> findByJobSeekerIdOrderBySavedAtDesc(UUID jobSeekerId);
    Optional<SavedJob> findByJobSeekerIdAndJobId(UUID jobSeekerId, UUID jobId);
    boolean existsByJobSeekerIdAndJobId(UUID jobSeekerId, UUID jobId);
}
