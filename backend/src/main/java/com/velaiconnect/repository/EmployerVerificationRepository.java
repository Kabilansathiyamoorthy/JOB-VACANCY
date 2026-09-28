package com.velaiconnect.repository;

import com.velaiconnect.model.EmployerVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmployerVerificationRepository extends JpaRepository<EmployerVerification, UUID> {
    Optional<EmployerVerification> findByEmployerId(UUID employerId);
    long countByStatus(com.velaiconnect.model.VerificationStatus status);
}
