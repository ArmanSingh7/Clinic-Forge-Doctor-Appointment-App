package com.doctorapp.service.impl;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Feedback;
import com.doctorapp.repository.IFeedbackRepository;
import com.doctorapp.service.IFeedbackService;
import com.doctorapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FeedbackServiceImpl implements IFeedbackService {

    @Autowired
    private IFeedbackRepository feedbackRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Feedback addFeedback(Feedback fbd) {
        Feedback saved = feedbackRepository.addFeedback(fbd);

        // Notify the doctor about new feedback
        if (saved.getDoctor() != null && saved.getDoctor().getUser() != null) {
            String patientName = saved.getPatient() != null ? saved.getPatient().getPatientName() : "A patient";
            notificationService.createNotification(
                    saved.getDoctor().getUser().getUserId(),
                    "New Feedback Received",
                    patientName + " left a " + saved.getRating() + "★ review",
                    "FEEDBACK_RECEIVED",
                    (long) saved.getFeedbackId());
        }

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Feedback getFeedback(Feedback fbd) {
        return feedbackRepository.getFeedback(fbd);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Feedback> getAllFeedbacks(Doctor doc) {
        return feedbackRepository.getAllFeedbacks(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Feedback> getFeedbackByAppointment(int appointmentId) {
        return feedbackRepository.getFeedbackByAppointment(appointmentId);
    }
}
