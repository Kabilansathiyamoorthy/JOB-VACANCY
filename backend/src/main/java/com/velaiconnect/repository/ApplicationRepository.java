package com.velaiconnect.repository;

import com.velaiconnect.model.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    boolean existsByJobIdAndJobSeekerId(UUID jobId, UUID jobSeekerId);
    Page<Application> findByJobSeekerIdOrderByAppliedAtDesc(UUID jobSeekerId, Pageable pageable);
    Page<Application> findByJobEmployerIdOrderByAppliedAtDesc(UUID employerId, Pageable pageable);
    Page<Application> findByJobEmployerIdAndStatusOrderByAppliedAtDesc(UUID employerId,
                                                                       com.velaiconnect.model.ApplicationStatus status,
                                                                       Pageable pageable);
    Page<Application> findByJobIdOrderByAppliedAtAsc(UUID jobId, Pageable pageable);
    Optional<Application> findByIdAndJobSeekerId(UUID id, UUID jobSeekerId);
    List<Application> findByJobId(UUID jobId);

    interface ApplicantCounts {
        String getStatus();
        Long getCount();
    }
    @org.springframework.data.jpa.repository.Query(
        "select a.status as status, count(a) as count from Application a where a.job.employer.id = :employerId group by a.status")
    List<ApplicantCounts> countByEmployerGrouped(@org.springframework.data.repository.query.Param("employerId") UUID employerId);
}
