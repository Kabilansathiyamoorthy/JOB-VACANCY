package com.velaiconnect.dto;

import lombok.*;

public class AdminDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserAdminView {
        private String id;
        private String mobileNumber;
        private String role;
        private boolean active;
        private boolean mobileVerified;
        private String displayName;
        private String createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class JobAdminView {
        private String id;
        private String title;
        private String companyName;
        private String city;
        private String status;
        private String employerName;
        private String createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReportView {
        private String id;
        private String jobId;
        private String jobTitle;
        private String reason;
        private String details;
        private String reporterMobile;
        private String status;
        private String createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class VerificationView {
        private String id;
        private String employerUserId;
        private String companyName;
        private String contactPerson;
        private String mobileNumber;
        private String gstNumber;
        private String companyRegNumber;
        private String documentUrls;
        private boolean mobileVerified;
        private boolean companyVerified;
        private boolean adminVerified;
        private String status;
        private String createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatsView {
        private long totalUsers;
        private long jobSeekers;
        private long employers;
        private long totalJobs;
        private long activeJobs;
        private long pendingJobs;
        private long totalApplications;
        private long openReports;
        private long pendingVerifications;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BlockRequest {
        private boolean active;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryRequest {
        @jakarta.validation.constraints.NotBlank private String code;
        @jakarta.validation.constraints.NotBlank private String nameEn;
        @jakarta.validation.constraints.NotBlank private String nameTa;
        private String icon;
        private Integer sortOrder;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TranslationRequest {
        @jakarta.validation.constraints.NotBlank private String key;
        @jakarta.validation.constraints.NotBlank private String locale;
        @jakarta.validation.constraints.NotBlank private String value;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BroadcastRequest {
        @jakarta.validation.constraints.NotBlank private String titleEn;
        @jakarta.validation.constraints.NotBlank private String titleTa;
        @jakarta.validation.constraints.NotBlank private String bodyEn;
        @jakarta.validation.constraints.NotBlank private String bodyTa;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReportActionRequest {
        private String status;   // RESOLVED / DISMISSED / REVIEWING
        private String action;   // REMOVE_JOB (optional)
    }
}
