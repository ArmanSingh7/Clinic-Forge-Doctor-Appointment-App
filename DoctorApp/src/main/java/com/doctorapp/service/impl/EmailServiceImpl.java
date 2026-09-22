package com.doctorapp.service.impl;

import com.doctorapp.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends email over SMTP when it is configured. When MAIL_USERNAME is empty (for
 * example on hosts that block SMTP), the message is written to the log instead so
 * the calling feature still completes and the content can be retrieved.
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        sendEmail(to, "Password Reset - Doctor App",
                "Hello,\n\n" +
                        "You requested a password reset for your Doctor App account.\n\n" +
                        "Click the link below to reset your password:\n" +
                        resetLink + "\n\n" +
                        "This link will expire in 1 hour.\n\n" +
                        "If you did not request this, please ignore this email.\n\n" +
                        "Regards,\nDoctor App Team");
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        if (mailUsername == null || mailUsername.isBlank()) {
            log.info("Email disabled (MAIL_USERNAME not set). Would send to {} — subject: {}\n{}", to, subject, body);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailUsername);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Failed to send email to {} (subject: {}): {}", to, subject, ex.getMessage());
            throw ex;
        }
    }
}
