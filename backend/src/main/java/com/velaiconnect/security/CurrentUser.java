package com.velaiconnect.security;

import com.velaiconnect.model.User;
import com.velaiconnect.model.UserRole;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Helper for controllers/services to fetch the current authenticated user
 * and enforce role-based access.
 */
public final class CurrentUser {

    private CurrentUser() {}

    public static User get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        throw new AccessDeniedException("Not authenticated");
    }

    public static UUID getId() {
        return get().getId();
    }

    public static void requireRole(UserRole role) {
        User user = get();
        if (user.getRole() != role) {
            throw new AccessDeniedException("Access denied for role " + user.getRole());
        }
    }
}
