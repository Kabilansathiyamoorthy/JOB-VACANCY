package com.velaiconnect.repository;

import com.velaiconnect.model.AdminUser;
import com.velaiconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {
    boolean existsByUserId(UUID userId);
}