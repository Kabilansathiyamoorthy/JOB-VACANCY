package com.velaiconnect.controller;

import com.velaiconnect.dto.ApiResponse;
import com.velaiconnect.dto.AuthDtos;
import com.velaiconnect.model.UserRole;
import com.velaiconnect.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Step 1: send OTP to the mobile number (LOGIN or REGISTRATION purpose). */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<AuthDtos.SendOtpResponse>> sendOtp(
            @Valid @RequestBody AuthDtos.SendOtpRequest req,
            @RequestParam(defaultValue = "LOGIN") String purpose) {
        AuthDtos.SendOtpResponse resp = authService.sendOtp(req.getMobileNumber(), purpose);
        return ResponseEntity.ok(ApiResponse.ok(resp,
                "OTP sent successfully", "OTP வெற்றிகரமாக அனுப்பப்பட்டது"));
    }

    /** Step 2: verify the 6-digit OTP and receive JWT tokens. */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthDtos.AuthResponse>> verifyOtp(
            @Valid @RequestBody AuthDtos.VerifyOtpRequest req) {
        AuthDtos.AuthResponse resp = authService.verifyOtp(
                req.getMobileNumber(), req.getOtp(), req.getPurpose());
        return ResponseEntity.ok(ApiResponse.ok(resp,
                "Verified successfully", "சரிபார்ப்பு வெற்றி"));
    }

    /** Registration step 3: choose JOB_SEEKER or EMPLOYER. */
    @PostMapping("/register/type")
    public ResponseEntity<ApiResponse<AuthDtos.AuthResponse>> setAccountType(
            @RequestBody Map<String, String> body) {
        String mobile = body.get("mobileNumber");
        String role = body.get("role");
        AuthDtos.AuthResponse resp = authService.setAccountType(mobile, UserRole.valueOf(role));
        return ResponseEntity.ok(ApiResponse.ok(resp,
                "Account type saved", "கணக்கு வகை சேமிக்கப்பட்டது"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthDtos.AuthResponse>> refresh(
            @Valid @RequestBody AuthDtos.RefreshRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refresh(req.getRefreshToken()),
                "Session refreshed", "அமர்வு புதுப்பிக்கப்பட்டது"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody Map<String, String> body) {
        authService.logout(body.getOrDefault("refreshToken", ""));
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Logged out", "வெளியேறிவிட்டீர்கள்"));
    }
}
