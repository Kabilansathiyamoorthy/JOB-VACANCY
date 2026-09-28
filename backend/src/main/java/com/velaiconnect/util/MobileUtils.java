package com.velaiconnect.util;

public final class MobileUtils {

    private MobileUtils() {}

    /** Normalize Indian mobile numbers: strip +91 / 0 prefixes, keep 10 digits. */
    public static String normalize(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() == 12 && digits.startsWith("91")) {
            digits = digits.substring(2);
        } else if (digits.length() == 11 && digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        return digits;
    }

    /** +91 98****7890 style mask for the OTP screen. */
    public static String mask(String tenDigit) {
        if (tenDigit == null || tenDigit.length() != 10) return tenDigit;
        return "+91 " + tenDigit.substring(0, 2) + "****" + tenDigit.substring(7);
    }
}
