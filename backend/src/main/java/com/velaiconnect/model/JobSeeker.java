package com.velaiconnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_seekers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JobSeeker {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "location_city", length = 120)
    private String locationCity;

    @Column(name = "location_state", length = 120)
    private String locationState = "Tamil Nadu";

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(length = 160)
    private String education;

    @Column(columnDefinition = "text")
    private String skills;                       // comma separated

    @Column(name = "experience_years", precision = 4, scale = 1)
    private BigDecimal experienceYears = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_category_id")
    private JobCategory preferredCategory;

    @Column(name = "expected_salary_min")
    private Integer expectedSalaryMin;

    @Column(name = "expected_salary_max")
    private Integer expectedSalaryMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_job_type")
    private JobType preferredJobType;

    @Column(name = "resume_url")
    private String resumeUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
