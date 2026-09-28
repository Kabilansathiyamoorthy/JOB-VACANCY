package com.velaiconnect.dto;

import lombok.*;

import java.util.List;

public class UserDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class JobSeekerProfile {
        private String userId;
        private String fullName;
        private String mobileNumber;
        private String city;
        private String education;
        private String skills;
        private Double experienceYears;
        private String preferredCategoryCode;
        private Integer expectedSalaryMin;
        private Integer expectedSalaryMax;
        private String preferredJobType;
        private String resumeUrl;
        private String profileImageUrl;
        private boolean profileComplete;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EmployerProfile {
        private String userId;
        private String companyName;
        private String companyType;
        private String companyDescription;
        private String city;
        private String contactPerson;
        private String logoUrl;
        private boolean verified;             // 🟢
        private String mobileNumber;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateJobSeekerProfileRequest {
        @jakarta.validation.constraints.NotBlank private String fullName;
        private String city;
        private String education;
        private String skills;
        private Double experienceYears;
        private String preferredCategoryCode;
        private Integer expectedSalaryMin;
        private Integer expectedSalaryMax;
        private String preferredJobType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateEmployerProfileRequest {
        @jakarta.validation.constraints.NotBlank private String companyName;
        private String companyType;
        private String companyDescription;
        private String city;
        @jakarta.validation.constraints.NotBlank private String contactPerson;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterJobSeekerRequest {
        @jakarta.validation.constraints.NotBlank private String fullName;
        private String city;
        private String education;
        private String skills;
        private Double experienceYears;
        private String preferredCategoryCode;
        private Integer expectedSalaryMin;
        private Integer expectedSalaryMax;
        private String preferredJobType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterEmployerRequest {
        @jakarta.validation.constraints.NotBlank private String companyName;
        private String companyType;
        private String companyDescription;
        private String city;
        @jakarta.validation.constraints.NotBlank private String contactPerson;
        private String gstNumber;
        private String companyRegNumber;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class JobAlertRequest {
        private String categoryCode;
        private String locationCity;
        private Integer minSalary;
        private String jobType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DeviceTokenRequest {
        @jakarta.validation.constraints.NotBlank private String fcmToken;
        private String platform;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReportRequest {
        @jakarta.validation.constraints.NotBlank private String jobId;
        @jakarta.validation.constraints.NotBlank
        @jakarta.validation.constraints.Pattern(regexp = "^(FAKE_JOB|ASKING_FOR_MONEY|WRONG_INFORMATION|SCAM|OTHER)$")
        private String reason;
        private String details;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NotificationItem {
        private String id;
        private String titleEn;
        private String titleTa;
        private String bodyEn;
        private String bodyTa;
        private boolean read;
        private String createdAt;
    }
}
