package com.velaiconnect.service;

import com.velaiconnect.model.Job;
import com.velaiconnect.model.JobAlert;
import com.velaiconnect.model.Notification;
import com.velaiconnect.model.User;
import com.velaiconnect.model.UserRole;
import com.velaiconnect.repository.DeviceTokenRepository;
import com.velaiconnect.repository.JobAlertRepository;
import com.velaiconnect.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * In-app notifications (notifications table) + optional FCM push.
 * FCM is only enabled when app.firebase.enabled=true and credentials are set.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final JobAlertRepository jobAlertRepository;

    @Value("${app.firebase.enabled:false}")
    private boolean firebaseEnabled;

    private static volatile com.google.firebase.messaging.FirebaseMessaging firebaseMessaging;
    private static boolean firebaseTried = false;

    private synchronized void ensureFirebase() {
        if (firebaseTried) return;
        firebaseTried = true;
        try {
            String creds = System.getenv("FIREBASE_CREDENTIALS_JSON");
            if (creds == null || creds.isBlank()) {
                creds = System.getProperty("FIREBASE_CREDENTIALS_JSON");
            }
            if (creds != null && !creds.isBlank()) {
                var options = com.google.firebase.FirebaseOptions.builder()
                        .setCredentials(com.google.auth.oauth2.GoogleCredentials
                                .fromStream(new java.io.ByteArrayInputStream(creds.getBytes())))
                        .build();
                com.google.firebase.FirebaseApp.initializeApp(options);
                firebaseMessaging = com.google.firebase.messaging.FirebaseMessaging.getInstance();
                log.info("Firebase Cloud Messaging initialized");
            }
        } catch (Exception e) {
            log.warn("Firebase init failed - push notifications disabled: {}", e.getMessage());
        }
    }

    /** Create an in-app notification row (bilingual) and push via FCM if configured. */
    @Transactional
    public void notifyUser(User user, String titleEn, String titleTa, String bodyEn, String bodyTa,
                           Map<String, String> data) {
        notificationRepository.save(Notification.builder()
                .user(user)
                .titleEn(titleEn)
                .titleTa(titleTa)
                .bodyEn(bodyEn)
                .bodyTa(bodyTa)
                .data(data == null ? null : new com.fasterxml.jackson.databind.ObjectMapper()
                        .valueToTree(data).toString())
                .build());

        if (firebaseEnabled) {
            ensureFirebase();
            if (firebaseMessaging != null) {
                deviceTokenRepository.findAll().stream()
                        .filter(t -> t.getUser().getId().equals(user.getId()))
                        .forEach(t -> {
                            try {
                                firebaseMessaging.send(com.google.firebase.messaging.Message.builder()
                                        .setToken(t.getFcmToken())
                                        .setNotification(com.google.firebase.messaging.Notification.builder()
                                                .setTitle(titleEn)
                                                .setBody(bodyEn)
                                                .build())
                                        .putAllData(data == null ? Map.of() : data)
                                        .build());
                            } catch (Exception e) {
                                log.warn("FCM send failed: {}", e.getMessage());
                            }
                        });
            }
        }
    }

    /** Notify seekers whose job alerts match a newly posted job. */
    @Transactional
    public void notifyJobAlerts(Job job) {
        try {
            List<JobAlert> alerts = jobAlertRepository.findAllByIsActiveTrue();
            for (JobAlert alert : alerts) {
                boolean match = true;
                if (alert.getCategory() != null && job.getCategory() != null
                        && !alert.getCategory().getId().equals(job.getCategory().getId())) match = false;
                if (alert.getLocationCity() != null && !alert.getLocationCity().isBlank()
                        && !job.getLocationCity().equalsIgnoreCase(alert.getLocationCity())) match = false;
                if (alert.getJobType() != null && alert.getJobType() != job.getJobType()) match = false;
                if (alert.getMinSalary() != null && job.getSalaryMax() != null
                        && job.getSalaryMax() < alert.getMinSalary()) match = false;

                if (match) {
                    notifyUser(alert.getJobSeeker().getUser(),
                            "New job matching your alert",
                            "உங்கள் அலர்ட்டுக்குப் பொருந்திய புதிய வேலை",
                            job.getTitle() + " at " + job.getCompanyName() + ", " + job.getLocationCity(),
                            (job.getTitleTa() == null ? job.getTitle() : job.getTitleTa())
                                    + " - " + job.getCompanyName(),
                            Map.of("type", "job_alert", "jobId", job.getId().toString()));
                }
            }
        } catch (Exception e) {
            log.warn("Job alert notification pass failed: {}", e.getMessage());
        }
    }

    @Transactional
    public void broadcast(List<User> users, String titleEn, String titleTa, String bodyEn, String bodyTa) {
        for (User u : users) {
            if (u.getRole() != UserRole.ADMIN) {
                notifyUser(u, titleEn, titleTa, bodyEn, bodyTa, Map.of("type", "broadcast"));
            }
        }
    }
}
