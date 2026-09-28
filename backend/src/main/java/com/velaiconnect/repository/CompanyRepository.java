package com.velaiconnect.repository;

import com.velaiconnect.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    List<Company> findByOwnerId(UUID ownerId);
    Optional<Company> findFirstByOwnerIdOrderByNameAsc(UUID ownerId);
}
