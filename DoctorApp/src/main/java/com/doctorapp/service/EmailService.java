package com.doctorapp.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String resetLink);

    void sendEmail(String to, String subject, String body);
}
