package com.velaiconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;        // English message (UI can translate)
    private String messageTa;      // Tamil message for direct display
    private T data;

    public static <T> ApiResponse<T> ok(T data, String message, String messageTa) {
        return ApiResponse.<T>builder().success(true).message(message).messageTa(messageTa).data(data).build();
    }
    public static <T> ApiResponse<T> ok(T data, String message) {
        return ok(data, message, null);
    }
    public static <T> ApiResponse<T> error(String message, String messageTa) {
        return ApiResponse.<T>builder().success(false).message(message).messageTa(messageTa).build();
    }
}
