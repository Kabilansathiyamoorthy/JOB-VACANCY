package com.velaiconnect.repository;

import com.velaiconnect.model.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobCategoryRepository extends JpaRepository<JobCategory, UUID> {
    Optional<JobCategory> findByCode(String code);
    List<JobCategory> findAllByIsActiveTrueOrderBySortOrderAsc();
}
