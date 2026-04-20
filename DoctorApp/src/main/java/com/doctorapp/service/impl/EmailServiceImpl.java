package com.doctorapp.service.impl;

import com.doctorapp.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset - Doctor App");
        message.setText(
                "Hello,\n\n" +
                        "You requested a password reset for your Doctor App account.\n\n" +
                        "Click the link below to reset your password:\n" +
                        resetLink + "\n\n" +
                        "This link will expire in 1 hour.\n\n" +
                        "If you did not request this, please ignore this email.\n\n" +
                        "Regards,\nDoctor App Team");
        mailSender.send(message);
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
