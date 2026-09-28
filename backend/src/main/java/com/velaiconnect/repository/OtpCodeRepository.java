package com.velaiconnect.repository;

import com.velaiconnect.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {
    Optional<OtpCode> findFirstByMobileNumberAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
            String mobileNumber, String purpose);

    long countByMobileNumberAndCreatedAtAfter(String mobileNumber, OffsetDateTime after);

    void deleteByExpiresAtBefore(OffsetDateTime cutoff);
}
