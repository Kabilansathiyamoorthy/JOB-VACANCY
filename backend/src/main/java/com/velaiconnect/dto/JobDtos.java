package com.velaiconnect.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class JobDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class JobResponse {
        private String id;
        private String title;
        private String titleTa;
        private String description;
        private String descriptionTa;
        private String companyName;
        private boolean verifiedEmployer;     // 🟢
        private String categoryCode;
        private String categoryNameEn;
        private String categoryNameTa;
        private String categoryIcon;
        private String locationCity;
        private String locationArea;
        private Double distanceKm;
        private Integer salaryMin;
        private Integer salaryMax;
        private String salaryPeriod;          // MONTHLY | DAILY | ...
        private String jobType;               // FULL_TIME | ...
        private String experienceRequired;
        private String qualification;
        private List<String> skills;
        private Integer vacancies;
        private boolean workFromHome;
        private boolean quickJob;
        private String status;
        private LocalDate applicationDeadline;
        private String contactPhone;
        private String postedAt;
        private Integer viewCount;
        private boolean saved;
        private boolean applied;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PostJobRequest {
        @NotBlank @Size(max = 160) private String title;
        private String titleTa;
        @NotBlank private String categoryId;          // category UUID
        @NotBlank @Size(max = 160) private String companyName;
        @NotBlank private String description;
        private String descriptionTa;
        @NotBlank @Size(max = 120) private String locationCity;
        private String locationArea;
        private Double latitude;
        private Double longitude;
        private Integer salaryMin;
        private Integer salaryMax;
        @NotBlank @Pattern(regexp = "^(HOURLY|DAILY|WEEKLY|MONTHLY|YEARLY)$") private String salaryPeriod;
        @NotBlank @Pattern(regexp = "^(FULL_TIME|PART_TIME|WORK_FROM_HOME|DAILY_WAGE|CONTRACT|INTERNSHIP)$")
        private String jobType;
        private String experienceRequired;            // FRESHER / 0-1 / 1-3 / 3-5 / 5+
        private String qualification;
        @NotEmpty private List<String> skills;
        @NotNull @Min(1) private Integer vacancies;
        private LocalDate applicationDeadline;
        private String contactPhone;
        private Boolean workFromHome;
        private Boolean quickJob;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class JobSearchRequest {
        private String search;                // title / skill / company / category text
        private String categoryCode;
        private String locationCity;
        private String jobType;               // FULL_TIME | PART_TIME | ...
        private String salaryPeriod;
        private Double minSalary;
        private Double maxSalary;
        private String experience;            // FRESHER only filter for now
        private String qualification;
        private Boolean fresherOnly;
        private Boolean workFromHome;
        private Boolean quickJobsOnly;
        private Boolean savedOnly;
        private Double latitude;
        private Double longitude;
        private Double radiusKm;              // 5 / 10 / 25 / 50
        private String savedByUserId;         // set internally
    }
}
