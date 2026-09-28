package com.velaiconnect.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AppConfig {

    @Bean
    public S3Client s3Client(
            @Value("${app.supabase.storage.endpoint}") String endpoint,
            @Value("${app.supabase.storage.access-key}") String accessKey,
            @Value("${app.supabase.storage.secret-key}") String secretKey,
            @Value("${app.supabase.storage.region}") String region) {

        return S3Client.builder()
                .endpointOverride(java.net.URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .forcePathStyle(true)
                .build();
    }

    @Bean
    public RestClient restClient() {
        return RestClient.create();
    }

    /** Log a clear warning when running with dev-only OTP mode. */
    @Bean
    public CommandLineRunner logOtpMode(@Value("${app.otp.dev-bypass:true}") boolean devBypass) {
        return args -> {
            if (devBypass) {
                org.slf4j.LoggerFactory.getLogger(AppConfig.class)
                        .warn("OTP DEV MODE is ON - OTP codes are returned in API responses. Set SMS_PROVIDER and OTP_DEV_MODE=false for production!");
            }
        };
    }
}
