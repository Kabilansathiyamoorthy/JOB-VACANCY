package com.velaiconnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title_en", nullable = false, length = 160)
    private String titleEn;

    @Column(name = "title_ta", nullable = false, length = 160)
    private String titleTa;

    @Column(name = "body_en", nullable = false, columnDefinition = "text")
    private String bodyEn;

    @Column(name = "body_ta", nullable = false, columnDefinition = "text")
    private String bodyTa;

    @Column(columnDefinition = "jsonb")
    private String data;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
