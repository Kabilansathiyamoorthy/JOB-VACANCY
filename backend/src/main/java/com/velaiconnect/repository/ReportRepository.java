package com.velaiconnect.repository;

import com.velaiconnect.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByStatusOrderByCreatedAtDesc(com.velaiconnect.model.ReportStatus status);
    List<Report> findAllByOrderByCreatedAtDesc();
    long countByStatus(com.velaiconnect.model.ReportStatus status);
}
