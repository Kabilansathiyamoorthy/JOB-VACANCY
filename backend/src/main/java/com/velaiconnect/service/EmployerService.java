package com.velaiconnect.service;

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
public class EmployerService {

    private final EmployerVerificationRepository verificationRepository;
    private final JobCategoryRepository categoryRepository;
    private final JobRepository jobRepository;
    private final UserService userService;

    // ---------- verification ----------
    @Transactional
    public EmployerVerification submitVerification(String gstNumber, String companyRegNumber,
                                                   String documentUrls) {
        Employer employer = userService.requireEmployer();

        EmployerVerification v = verificationRepository.findByEmployerId(employer.getId())
                .orElseGet(() -> EmployerVerification.builder().employer(employer).build());

        v.setGstNumber(gstNumber);
        v.setCompanyRegNumber(companyRegNumber);
        if (documentUrls != null && !documentUrls.isBlank()) {
            v.setDocumentUrls(documentUrls);
        }
        v.setMobileVerified(true);           // login OTP already proves the mobile number
        v.setStatus(VerificationStatus.PENDING);
        verificationRepository.save(v);
        return v;
    }

    @Transactional(readOnly = true)
    public EmployerVerification getMyVerification() {
        Employer employer = userService.requireEmployer();
        return verificationRepository.findByEmployerId(employer.getId()).orElse(null);
    }

    // ---------- helpers ----------
    @Transactional(readOnly = true)
    public List<Job> myJobs(Employer employer) {
        return jobRepository.findByEmployerIdOrderByCreatedAtDesc(employer.getId());
    }
}
