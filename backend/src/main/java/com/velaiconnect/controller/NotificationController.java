package com.velaiconnect.controller;

import com.velaiconnect.dto.ApiResponse;
import com.velaiconnect.dto.PageResponse;
import com.velaiconnect.security.CurrentUser;
import com.velaiconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final com.velaiconnect.repository.NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<com.velaiconnect.model.Notification>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var p = notificationRepository.findByUserIdOrderByCreatedAtDesc(CurrentUser.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(p), null, null));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount() {
        long count = notificationRepository.countByUserIdAndIsReadFalse(CurrentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count), null, null));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable String id) {
        var n = notificationRepository.findById(UUID.fromString(id)).orElse(null);
        if (n != null && n.getUser().getId().equals(CurrentUser.getId())) {
            n.setRead(true);
            notificationRepository.save(n);
        }
        return ResponseEntity.ok(ApiResponse.ok(null, null, null));
    }
}
