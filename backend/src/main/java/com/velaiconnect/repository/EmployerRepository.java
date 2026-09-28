package com.velaiconnect.repository;

import com.velaiconnect.model.Employer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmployerRepository extends JpaRepository<Employer, UUID> {
    Optional<Employer> findByUserId(UUID userId);
}
