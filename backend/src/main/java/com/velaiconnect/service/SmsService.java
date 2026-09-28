package com.velaiconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Sends OTP SMS through the configured provider.
 * provider=none → dev mode: the OTP is only logged (and returned by the API).
 */
@Service
@Slf4j
public class SmsService {

    private final RestClient restClient = RestClient.create();
    private final String provider;
    private final String twilioSid;
    private final String twilioToken;
    private final String twilioFrom;
    private final String msg91Key;
    private final String msg91Template;
    private final String fast2smsKey;

    public SmsService(
            @Value("${app.otp.sms.provider:none}") String provider,
            @Value("${app.otp.sms.twilio.account-sid:}") String twilioSid,
            @Value("${app.otp.sms.twilio.auth-token:}") String twilioToken,
            @Value("${app.otp.sms.twilio.from-number:}") String twilioFrom,
            @Value("${app.otp.sms.msg91.auth-key:}") String msg91Key,
            @Value("${app.otp.sms.msg91.template-id:}") String msg91Template,
            @Value("${app.otp.sms.fast2sms.api-key:}") String fast2smsKey) {
        this.provider = provider;
        this.twilioSid = twilioSid;
        this.twilioToken = twilioToken;
        this.twilioFrom = twilioFrom;
        this.msg91Key = msg91Key;
        this.msg91Template = msg91Template;
        this.fast2smsKey = fast2smsKey;
    }

    public void sendOtp(String mobileNumber, String otp) {
        String message = otp + " is your VelaiConnect verification code. Do not share it with anyone.";
        switch (provider) {
            case "twilio" -> sendViaTwilio(mobileNumber, message);
            case "msg91" -> sendViaMsg91(mobileNumber, otp);
            case "fast2sms" -> sendViaFast2Sms(mobileNumber, message);
            default -> log.info("[DEV OTP] Mobile: {} | OTP: {}", mobileNumber, otp);
        }
    }

    private void sendViaTwilio(String mobile, String message) {
        try {
            String auth = twilioSid + ":" + twilioToken;
            String encoded = java.util.Base64.getEncoder().encodeToString(auth.getBytes());
            restClient.post()
                    .uri("https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json", twilioSid)
                    .header("Authorization", "Basic " + encoded)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .body("To=%2B91" + mobile + "&From=" + twilioFrom + "&Body=" + java.net.URLEncoder.encode(message, java.nio.charset.StandardCharsets.UTF_8))
                    .retrieve().toBodilessEntity();
        } catch (Exception e) {
            log.error("Twilio SMS failed: {}", e.getMessage());
            throw new com.velaiconnect.exception.ApiException(
                    "Could not send OTP. Try again", "OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்", e);
        }
    }

    private void sendViaMsg91(String mobile, String otp) {
        try {
            restClient.post()
                    .uri("https://control.msg91.com/api/v5/flow/")
                    .header("authkey", msg91Key)
                    .header("Content-Type", "application/json")
                    .body(Map.of("template_id", msg91Template, "mobiles", "91" + mobile, "OTP", otp))
                    .retrieve().toBodilessEntity();
        } catch (Exception e) {
            log.error("MSG91 SMS failed: {}", e.getMessage());
            throw new com.velaiconnect.exception.ApiException(
                    "Could not send OTP. Try again", "OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்", e);
        }
    }

    private void sendViaFast2Sms(String mobile, String message) {
        try {
            restClient.post()
                    .uri("https://www.fast2sms.com/dev/bulkV2")
                    .header("authorization", fast2smsKey)
                    .header("Content-Type", "application/json")
                    .body(Map.of("route", "otp", "variables_values", message, "numbers", mobile))
                    .retrieve().toBodilessEntity();
        } catch (Exception e) {
            log.error("Fast2SMS failed: {}", e.getMessage());
            throw new com.velaiconnect.exception.ApiException(
                    "Could not send OTP. Try again", "OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்", e);
        }
    }
}
