package com.doctorapp.service;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Feedback;

import java.util.List;
import java.util.Optional;

public interface IFeedbackService {

    Feedback addFeedback(Feedback fbd);

    Feedback getFeedback(Feedback fbd);

    List<Feedback> getAllFeedbacks(Doctor doc);

    Optional<Feedback> getFeedbackByAppointment(int appointmentId);
}
