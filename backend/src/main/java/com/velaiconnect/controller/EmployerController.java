package com.velaiconnect.controller;

import com.velaiconnect.dto.ApiResponse;
import com.velaiconnect.dto.UserDtos;
import com.velaiconnect.model.UserRole;
import com.velaiconnect.security.CurrentUser;
import com.velaiconnect.service.EmployerService;
import com.velaiconnect.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer")
@RequiredArgsConstructor
public class EmployerController {

    private final UserService userService;
    private final EmployerService employerService;
    private final com.velaiconnect.service.StorageService storageService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDtos.EmployerProfile>> me() {
        CurrentUser.requireRole(UserRole.EMPLOYER);
        return ResponseEntity.ok(ApiResponse.ok(userService.getEmployerProfile(CurrentUser.getId()), null, null));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDtos.EmployerProfile>> updateMe(
            @Valid @RequestBody UserDtos.UpdateEmployerProfileRequest req) {
        CurrentUser.requireRole(UserRole.EMPLOYER);
        return ResponseEntity.ok(ApiResponse.ok(userService.updateEmployerProfile(CurrentUser.getId(), req),
                "Profile updated", "சுயவிவரம் புதுப்பிக்கப்பட்டது"));
    }

    @PostMapping(value = "/verification", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> submitVerification(
            @RequestParam(value = "gstNumber", required = false) String gstNumber,
            @RequestParam(value = "companyRegNumber", required = false) String companyRegNumber,
            @RequestPart(value = "documents", required = false) List<MultipartFile> documents) {

        CurrentUser.requireRole(UserRole.EMPLOYER);
        StringBuilder urls = new StringBuilder();
        if (documents != null) {
            for (MultipartFile doc : documents) {
                if (doc != null && !doc.isEmpty()) {
                    String url = storageService.uploadVerificationDoc(doc, CurrentUser.getId());
                    if (urls.length() > 0) urls.append(",");
                    urls.append(url);
                }
            }
        }
        employerService.submitVerification(gstNumber, companyRegNumber, urls.toString());
        return ResponseEntity.ok(ApiResponse.ok(null,
                "Verification submitted for admin review",
                "சரிபார்ப்புக்காக சமர்ப்பிக்கப்பட்டது. நிர்வாக மறுஆய்வு நடைபெறும்"));
    }

    @GetMapping("/verification")
    public ResponseEntity<ApiResponse<Object>> myVerification() {
        CurrentUser.requireRole(UserRole.EMPLOYER);
        return ResponseEntity.ok(ApiResponse.ok(employerService.getMyVerification(), null, null));
    }
}
