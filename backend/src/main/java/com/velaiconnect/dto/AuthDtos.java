package com.velaiconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

public class AuthDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SendOtpRequest {
        @NotBlank
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
        private String mobileNumber;      // 10 digits, no country code
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class VerifyOtpRequest {
        @NotBlank
        @Pattern(regexp = "^[6-9]\\d{9}$")
        private String mobileNumber;

        @NotBlank
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits")
        private String otp;

        @NotBlank
        @Pattern(regexp = "^(LOGIN|REGISTRATION)$")
        private String purpose;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SendOtpResponse {
        private boolean success;
        private boolean existingUser;
        private String maskedMobile;      // +91 98****7890
        private String devOtp;            // ONLY returned in dev mode (no SMS provider)
        private long resendAfterSeconds;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String role;              // JOB_SEEKER | EMPLOYER | ADMIN
        private String userId;
        private String displayName;
        private boolean profileComplete;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }
}
