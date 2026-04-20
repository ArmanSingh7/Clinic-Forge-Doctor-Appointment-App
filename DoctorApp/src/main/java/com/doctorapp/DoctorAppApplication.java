package com.doctorapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DoctorAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoctorAppApplication.class, args);
        System.out.println("Running");
    }
}
