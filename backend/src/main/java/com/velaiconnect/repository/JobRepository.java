package com.velaiconnect.repository;

import com.velaiconnect.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID>, JpaSpecificationExecutor<Job> {

    List<Job> findByEmployerIdOrderByCreatedAtDesc(UUID employerId);

    List<Job> findTop20ByIsQuickJobTrueAndStatusOrderByCreatedAtDesc(com.velaiconnect.model.JobStatus status);

    List<Job> findTop50ByStatusOrderByCreatedAtDesc(com.velaiconnect.model.JobStatus status);

    List<Job> findTop200ByStatusOrderByCreatedAtDesc(com.velaiconnect.model.JobStatus status);

    Page<Job> findByStatus(com.velaiconnect.model.JobStatus status, org.springframework.data.domain.Pageable pageable);

    long countByStatus(com.velaiconnect.model.JobStatus status);

    @Modifying
    @Query("update Job j set j.viewCount = j.viewCount + 1 where j.id = :id")
    void incrementViewCount(@Param("id") UUID id);
}
