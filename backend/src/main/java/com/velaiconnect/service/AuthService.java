package com.velaiconnect.service;

import com.velaiconnect.dto.AuthDtos;
import com.velaiconnect.exception.ApiException;
import com.velaiconnect.model.OtpCode;
import com.velaiconnect.model.RefreshToken;
import com.velaiconnect.model.User;
import com.velaiconnect.model.UserRole;
import com.velaiconnect.repository.OtpCodeRepository;
import com.velaiconnect.repository.RefreshTokenRepository;
import com.velaiconnect.repository.UserRepository;
import com.velaiconnect.security.JwtTokenProvider;
import com.velaiconnect.util.HashUtils;
import com.velaiconnect.util.MobileUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final SmsService smsService;
    private final UserService userService;

    @Value("${app.otp.length:6}") private int otpLength;
    @Value("${app.otp.expiry-minutes:5}") private int otpExpiryMinutes;
    @Value("${app.otp.max-attempts:5}") private int otpMaxAttempts;
    @Value("${app.otp.max-sends-per-hour:5}") private int otpMaxSendsPerHour;
    @Value("${app.otp.dev-bypass:true}") private boolean devBypass;
    @Value("${app.jwt.refresh-token-expiry-ms:2592000000}") private long refreshExpiryMs;

    // ---------- SEND OTP ----------
    @Transactional
    public AuthDtos.SendOtpResponse sendOtp(String rawMobile, String purpose) {
        String mobile = MobileUtils.normalize(rawMobile);
        if (mobile == null || !mobile.matches("[6-9]\\d{9}")) {
            throw new ApiException("Enter a valid 10-digit mobile number",
                    "சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்");
        }

        // rate limit: max N sends per hour per number
        OffsetDateTime oneHourAgo = OffsetDateTime.now().minusHours(1);
        long sent = otpCodeRepository.countByMobileNumberAndCreatedAtAfter(mobile, oneHourAgo);
        if (sent >= otpMaxSendsPerHour) {
            throw new ApiException("Too many OTP requests. Please try again later",
                    "அதிக OTP கோரிக்கைகள். பிறகு முயற்சிக்கவும்");
        }

        // create user record lazily for registration flow (role finalized later)
        if ("REGISTRATION".equals(purpose) && !userRepository.existsByMobileNumber(mobile)) {
            userRepository.save(User.builder()
                    .mobileNumber(mobile)
                    .role(UserRole.JOB_SEEKER)
                    .mobileVerified(false)
                    .isActive(true)
                    .build());
        }

        String otp = HashUtils.randomNumericOtp(otpLength);
        OtpCode code = OtpCode.builder()
                .mobileNumber(mobile)
                .codeHash(HashUtils.sha256(otp))
                .purpose(purpose)
                .expiresAt(OffsetDateTime.now().plusMinutes(otpExpiryMinutes))
                .build();
        otpCodeRepository.save(code);

        smsService.sendOtp(mobile, otp);

        User user = userRepository.findByMobileNumber(mobile).orElse(null);
        boolean existingUser = user != null && user.isMobileVerified();

        return AuthDtos.SendOtpResponse.builder()
                .success(true)
                .existingUser(existingUser)
                .maskedMobile(MobileUtils.mask(mobile))
                .devOtp(devBypass ? otp : null)
                .resendAfterSeconds(30)
                .build();
    }

    // ---------- VERIFY OTP ----------
    @Transactional
    public AuthDtos.AuthResponse verifyOtp(String rawMobile, String otp, String purpose) {
        String mobile = MobileUtils.normalize(rawMobile);

        OtpCode code = otpCodeRepository
                .findFirstByMobileNumberAndPurposeAndConsumedFalseOrderByCreatedAtDesc(mobile, purpose)
                .orElseThrow(() -> new ApiException("OTP not found. Request a new one",
                        "OTP கிடைக்கவில்லை. புதிய OTP கோரவும்"));

        if (code.isExpired()) {
            throw new ApiException("OTP has expired. Request a new one",
                    "OTP காலாவதியாகிவிட்டது. புதிய OTP கோரவும்");
        }
        if (code.getAttempts() >= otpMaxAttempts) {
            throw new ApiException("Too many wrong attempts. Request a new OTP",
                    "அதிக தவறான முயற்சிகள். புதிய OTP கோரவும்");
        }
        if (!code.getCodeHash().equals(HashUtils.sha256(otp))) {
            code.setAttempts(code.getAttempts() + 1);
            otpCodeRepository.save(code);
            throw new ApiException("Incorrect OTP. Please try again",
                    "தவறான OTP. மீண்டும் முயற்சிக்கவும்");
        }

        code.setConsumed(true);
        otpCodeRepository.save(code);

        User user = userRepository.findByMobileNumber(mobile)
                .orElseThrow(() -> new ApiException("User not found", "பயனர் கிடைக்கவில்லை"));

        user.setMobileVerified(true);
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user, userService.isProfileComplete(user));
    }

    // ---------- REGISTRATION: set account type ----------
    @Transactional
    public AuthDtos.AuthResponse setAccountType(String rawMobile, UserRole role) {
        String mobile = MobileUtils.normalize(rawMobile);
        User user = userRepository.findByMobileNumber(mobile)
                .orElseThrow(() -> new ApiException("User not found", "பயனர் கிடைக்கவில்லை"));

        if (!user.isMobileVerified()) {
            throw new ApiException("Please verify your mobile number first",
                    "முதலில் உங்கள் கைபேசி எண்ணை சரிபார்க்கவும்");
        }
        if (userService.isProfileComplete(user)) {
            throw new ApiException("This number is already registered",
                    "இந்த எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது");
        }

        user.setRole(role);
        userRepository.save(user);
        return buildAuthResponse(user, false);
    }

    // ---------- REFRESH ----------
    @Transactional
    public AuthDtos.AuthResponse refresh(String rawRefreshToken) {
        String hash = HashUtils.sha256(rawRefreshToken);
        RefreshToken rt = refreshTokenRepository.findByTokenHashAndRevokedFalse(hash)
                .orElseThrow(() -> new ApiException("Session expired. Please login again",
                        "அமர்வு காலாவதியாகிவிட்டது. மீண்டும் உள்நுழையவும்"));

        if (rt.getExpiresAt().isBefore(OffsetDateTime.now())) {
            rt.setRevoked(true);
            throw new ApiException("Session expired. Please login again",
                    "அமர்வு காலாவதியாகிவிட்டது. மீண்டும் உள்நுழையவும்");
        }

        User user = rt.getUser();
        return buildAuthResponse(user, userService.isProfileComplete(user));
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByTokenHashAndRevokedFalse(HashUtils.sha256(rawRefreshToken))
                .ifPresent(rt -> rt.setRevoked(true));
    }

    // ---------- helpers ----------
    private AuthDtos.AuthResponse buildAuthResponse(User user, boolean profileComplete) {
        String access = jwtTokenProvider.createAccessToken(user.getId(), user.getRole().name());
        String refresh = HashUtils.randomToken();

        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(HashUtils.sha256(refresh))
                .expiresAt(OffsetDateTime.now().plusNanos(refreshExpiryMs * 1_000_000))
                .build());

        String displayName = userService.getDisplayName(user);

        return AuthDtos.AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .role(user.getRole().name())
                .userId(user.getId().toString())
                .displayName(displayName)
                .profileComplete(profileComplete)
                .build();
    }
}
