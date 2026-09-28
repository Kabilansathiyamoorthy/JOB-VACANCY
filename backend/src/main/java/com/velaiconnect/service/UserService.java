package com.velaiconnect.service;

import com.velaiconnect.dto.UserDtos;
import com.velaiconnect.exception.ApiException;
import com.velaiconnect.model.*;
import com.velaiconnect.repository.*;
import com.velaiconnect.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final EmployerRepository employerRepository;
    private final CompanyRepository companyRepository;
    private final JobCategoryRepository categoryRepository;

    // ---------- helpers used by AuthService ----------
    @Transactional
    public boolean isProfileComplete(User user) {
        return switch (user.getRole()) {
            case ADMIN -> true;
            case JOB_SEEKER -> jobSeekerRepository.findByUserId(user.getId()).isPresent();
            case EMPLOYER -> employerRepository.findByUserId(user.getId()).isPresent();
        };
    }

    @Transactional
    public String getDisplayName(User user) {
        return switch (user.getRole()) {
            case JOB_SEEKER -> jobSeekerRepository.findByUserId(user.getId())
                    .map(JobSeeker::getFullName).orElse(null);
            case EMPLOYER -> employerRepository.findByUserId(user.getId())
                    .map(e -> e.getCompany().getName()).orElse(null);
            case ADMIN -> "Admin";
        };
    }

    // ---------- JOB SEEKER ----------
    @Transactional
    public UserDtos.JobSeekerProfile registerJobSeeker(UUID userId, UserDtos.RegisterJobSeekerRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", "பயனர் கிடைக்கவில்லை"));

        if (jobSeekerRepository.findByUserId(userId).isPresent()) {
            throw new ApiException("Profile already exists", "சுயவிவரம் ஏற்கனவே உள்ளது");
        }

        JobCategory category = req.getPreferredCategoryCode() == null ? null :
                categoryRepository.findByCode(req.getPreferredCategoryCode()).orElse(null);

        jobSeekerRepository.save(JobSeeker.builder()
                .user(user)
                .fullName(req.getFullName())
                .locationCity(req.getCity())
                .education(req.getEducation())
                .skills(req.getSkills())
                .experienceYears(req.getExperienceYears() == null ? java.math.BigDecimal.ZERO
                        : java.math.BigDecimal.valueOf(req.getExperienceYears()))
                .preferredCategory(category)
                .expectedSalaryMin(req.getExpectedSalaryMin())
                .expectedSalaryMax(req.getExpectedSalaryMax())
                .preferredJobType(req.getPreferredJobType() == null ? null
                        : JobType.valueOf(req.getPreferredJobType()))
                .build());

        profileRepository.findByUserId(userId).orElseGet(() -> profileRepository.save(Profile.builder()
                .user(user)
                .displayName(req.getFullName())
                .build()));

        return getJobSeekerProfile(userId);
    }

    @Transactional
    public UserDtos.JobSeekerProfile getJobSeekerProfile(UUID userId) {
        JobSeeker js = jobSeekerRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Profile not found", "சுயவிவரம் கிடைக்கவில்லை"));
        Profile p = profileRepository.findByUserId(userId).orElse(null);

        return UserDtos.JobSeekerProfile.builder()
                .userId(userId.toString())
                .fullName(js.getFullName())
                .mobileNumber(js.getUser().getMobileNumber())
                .city(js.getLocationCity())
                .education(js.getEducation())
                .skills(js.getSkills())
                .experienceYears(js.getExperienceYears() == null ? 0.0 : js.getExperienceYears().doubleValue())
                .preferredCategoryCode(js.getPreferredCategory() == null ? null : js.getPreferredCategory().getCode())
                .expectedSalaryMin(js.getExpectedSalaryMin())
                .expectedSalaryMax(js.getExpectedSalaryMax())
                .preferredJobType(js.getPreferredJobType() == null ? null : js.getPreferredJobType().name())
                .resumeUrl(js.getResumeUrl())
                .profileImageUrl(p == null ? null : p.getProfileImageUrl())
                .profileComplete(true)
                .build();
    }

    @Transactional
    public UserDtos.JobSeekerProfile updateJobSeekerProfile(UUID userId, UserDtos.UpdateJobSeekerProfileRequest req) {
        JobSeeker js = jobSeekerRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Profile not found", "சுயவிவரம் கிடைக்கவில்லை"));

        js.setFullName(req.getFullName());
        js.setLocationCity(req.getCity());
        js.setEducation(req.getEducation());
        js.setSkills(req.getSkills());
        if (req.getExperienceYears() != null) {
            js.setExperienceYears(java.math.BigDecimal.valueOf(req.getExperienceYears()));
        }
        if (req.getPreferredCategoryCode() != null) {
            js.setPreferredCategory(categoryRepository.findByCode(req.getPreferredCategoryCode()).orElse(null));
        }
        js.setExpectedSalaryMin(req.getExpectedSalaryMin());
        js.setExpectedSalaryMax(req.getExpectedSalaryMax());
        if (req.getPreferredJobType() != null) {
            js.setPreferredJobType(JobType.valueOf(req.getPreferredJobType()));
        }
        jobSeekerRepository.save(js);
        return getJobSeekerProfile(userId);
    }

    // ---------- EMPLOYER ----------
    @Transactional
    public UserDtos.EmployerProfile registerEmployer(UUID userId, UserDtos.RegisterEmployerRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", "பயனர் கிடைக்கவில்லை"));

        if (employerRepository.findByUserId(userId).isPresent()) {
            throw new ApiException("Profile already exists", "சுயவிவரம் ஏற்கனவே உள்ளது");
        }

        Company company = companyRepository.save(Company.builder()
                .owner(user)
                .name(req.getCompanyName())
                .companyType(req.getCompanyType())
                .description(req.getCompanyDescription())
                .locationCity(req.getCity())
                .build());

        Employer employer = employerRepository.save(Employer.builder()
                .user(user)
                .company(company)
                .contactPerson(req.getContactPerson())
                .isVerified(false)
                .build());

        profileRepository.findByUserId(userId).orElseGet(() -> profileRepository.save(Profile.builder()
                .user(user)
                .displayName(req.getCompanyName())
                .build()));

        return getEmployerProfile(employer.getId());
    }

    @Transactional
    public UserDtos.EmployerProfile getEmployerProfile(UUID userId) {
        Employer e = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Profile not found", "சுயவிவரம் கிடைக்கவில்லை"));

        Company c = e.getCompany();
        return UserDtos.EmployerProfile.builder()
                .userId(userId.toString())
                .companyName(c.getName())
                .companyType(c.getCompanyType())
                .companyDescription(c.getDescription())
                .city(c.getLocationCity())
                .contactPerson(e.getContactPerson())
                .logoUrl(c.getLogoUrl())
                .verified(e.isVerified())
                .mobileNumber(e.getUser().getMobileNumber())
                .build();
    }

    @Transactional
    public UserDtos.EmployerProfile updateEmployerProfile(UUID userId, UserDtos.UpdateEmployerProfileRequest req) {
        Employer e = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Profile not found", "சுயவிவரம் கிடைக்கவில்லை"));

        Company c = e.getCompany();
        c.setName(req.getCompanyName());
        c.setCompanyType(req.getCompanyType());
        c.setDescription(req.getCompanyDescription());
        c.setLocationCity(req.getCity());
        companyRepository.save(c);

        e.setContactPerson(req.getContactPerson());
        employerRepository.save(e);

        return getEmployerProfile(userId);
    }

    /** Find the JobSeeker row for the current user, enforcing the JOB_SEEKER role. */
    @Transactional
    public JobSeeker requireJobSeeker() {
        User user = CurrentUser.get();
        CurrentUser.requireRole(UserRole.JOB_SEEKER);
        return jobSeekerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Profile not found. Complete registration first",
                        "சுயவிவரம் கிடைக்கவில்லை. முதலில் பதிவு செய்யவும்"));
    }

    /** Find the Employer row for the current user, enforcing the EMPLOYER role. */
    @Transactional
    public Employer requireEmployer() {
        User user = CurrentUser.get();
        CurrentUser.requireRole(UserRole.EMPLOYER);
        return employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Employer profile not found",
                        "முதலாளி சுயவிவரம் கிடைக்கவில்லை"));
    }

    @Transactional
    public List<JobCategory> getActiveCategories() {
        return categoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc();
    }
}
