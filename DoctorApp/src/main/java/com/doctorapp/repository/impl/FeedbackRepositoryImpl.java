package com.doctorapp.repository.impl;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Feedback;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.IFeedbackRepository;
import com.doctorapp.repository.jpa.FeedbackJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class FeedbackRepositoryImpl implements IFeedbackRepository {

    @Autowired
    private FeedbackJpaRepository feedbackJpaRepository;

    @Override
    public Feedback addFeedback(Feedback fbd) {
        return feedbackJpaRepository.save(fbd);
    }

    @Override
    public Feedback getFeedback(Feedback fbd) {
        return feedbackJpaRepository.findById(fbd.getFeedbackId())
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", "feedbackId", fbd.getFeedbackId()));
    }

    @Override
    public List<Feedback> getAllFeedbacks(Doctor doc) {
        return feedbackJpaRepository.findByDoctor(doc);
    }

    @Override
    public Optional<Feedback> getFeedbackByAppointment(int appointmentId) {
        return feedbackJpaRepository.findByAppointment_AppointmentId(appointmentId);
    }
}
