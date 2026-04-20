package com.doctorapp.service.impl;

import com.doctorapp.entity.AvailabilityDates;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.TimeSlot;
import com.doctorapp.repository.IDoctorRepository;
import com.doctorapp.repository.jpa.TimeSlotJpaRepository;
import com.doctorapp.service.IDoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class DoctorServiceImpl implements IDoctorService {

    @Autowired
    private IDoctorRepository doctorRepository;

    @Autowired
    private TimeSlotJpaRepository timeSlotJpaRepository;

    @Override
    public Doctor addDoctor(Doctor bean) {
        return doctorRepository.addDoctor(bean);
    }

    @Override
    public Doctor updateDoctorProfile(Doctor bean) {
        return doctorRepository.updateDoctorProfile(bean);
    }

    @Override
    public AvailabilityDates addAvailability(AvailabilityDates bean) {
        AvailabilityDates saved = doctorRepository.addAvailability(bean);
        generateTimeSlotsForAvailability(saved);
        return saved;
    }

    @Override
    public AvailabilityDates updateAvailability(AvailabilityDates bean) {
        AvailabilityDates updated = doctorRepository.updateAvailability(bean);
        // Remove old slots (only unbooked) and regenerate
        timeSlotJpaRepository.deleteByDoctorAndDateBetween(
                updated.getDoctor(), updated.getFromDate(), updated.getEndDate());
        generateTimeSlotsForAvailability(updated);
        return updated;
    }

    private void generateTimeSlotsForAvailability(AvailabilityDates avail) {
        LocalTime startOfDay = LocalTime.of(9, 0);
        LocalTime endOfDay = LocalTime.of(17, 0);
        int slotDurationMinutes = 30;

        List<TimeSlot> slots = new ArrayList<>();
        LocalDate date = avail.getFromDate();
        while (!date.isAfter(avail.getEndDate())) {
            // Check if slots already exist for this doctor+date
            List<TimeSlot> existing = timeSlotJpaRepository.findByDoctorAndDate(avail.getDoctor(), date);
            if (existing.isEmpty()) {
                LocalTime time = startOfDay;
                while (time.plusMinutes(slotDurationMinutes).compareTo(endOfDay) <= 0) {
                    TimeSlot slot = new TimeSlot();
                    slot.setDoctor(avail.getDoctor());
                    slot.setDate(date);
                    slot.setStartTime(time);
                    slot.setEndTime(time.plusMinutes(slotDurationMinutes));
                    slot.setBooked(false);
                    slots.add(slot);
                    time = time.plusMinutes(slotDurationMinutes);
                }
            }
            date = date.plusDays(1);
        }
        if (!slots.isEmpty()) {
            timeSlotJpaRepository.saveAll(slots);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Doctor getDoctor(Doctor doc) {
        return doctorRepository.getDoctor(doc);
    }

    @Override
    public Doctor removeDoctor(Doctor doc) {
        return doctorRepository.removeDoctor(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> getDoctorList() {
        return doctorRepository.getDoctorList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> getDoctorList(String speciality) {
        return doctorRepository.getDoctorList(speciality);
    }
}
