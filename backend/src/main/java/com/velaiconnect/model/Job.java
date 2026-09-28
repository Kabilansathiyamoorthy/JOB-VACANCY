package com.velaiconnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "jobs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private JobCategory category;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(name = "title_ta", length = 160)
    private String titleTa;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "description_ta", columnDefinition = "text")
    private String descriptionTa;

    @Column(name = "company_name", nullable = false, length = 160)
    private String companyName;

    @Column(name = "location_city", nullable = false, length = 120)
    private String locationCity;

    @Column(name = "location_area", length = 120)
    private String locationArea;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "salary_period", nullable = false)
    private SalaryPeriod salaryPeriod = SalaryPeriod.MONTHLY;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private JobType jobType = JobType.FULL_TIME;

    @Column(name = "experience_required", nullable = false, length = 80)
    private String experienceRequired = "FRESHER";

    @Column(length = 120)
    private String qualification;

    @Column(name = "vacancies", nullable = false)
    private Integer vacancies = 1;

    @Column(name = "contact_phone", length = 15)
    private String contactPhone;

    @Column(name = "is_work_from_home", nullable = false)
    private boolean isWorkFromHome = false;

    @Column(name = "is_quick_job", nullable = false)
    private boolean isQuickJob = false;      // "Need a job today?" section

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.PENDING_APPROVAL;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobSkill> skills = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
