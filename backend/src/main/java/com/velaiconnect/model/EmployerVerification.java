package com.velaiconnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "employer_verifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmployerVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false, unique = true)
    private Employer employer;

    @Column(name = "gst_number", length = 20)
    private String gstNumber;

    @Column(name = "company_reg_number", length = 60)
    private String companyRegNumber;

    @Column(name = "document_urls", columnDefinition = "text")
    private String documentUrls;

    @Column(name = "mobile_verified", nullable = false)
    private boolean mobileVerified;

    @Column(name = "company_verified", nullable = false)
    private boolean companyVerified;

    @Column(name = "admin_verified", nullable = false)
    private boolean adminVerified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "admin_notes", columnDefinition = "text")
    private String adminNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
