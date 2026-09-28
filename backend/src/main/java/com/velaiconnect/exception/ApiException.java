package com.velaiconnect.exception;

import lombok.Getter;

/**
 * Business exception carrying both English and Tamil messages so the
 * mobile app can display errors in the user's selected language.
 */
@Getter
public class ApiException extends RuntimeException {

    private final String messageTa;

    public ApiException(String messageEn, String messageTa) {
        super(messageEn);
        this.messageTa = messageTa;
    }

    public ApiException(String messageEn, String messageTa, Throwable cause) {
        super(messageEn, cause);
        this.messageTa = messageTa;
    }
}
