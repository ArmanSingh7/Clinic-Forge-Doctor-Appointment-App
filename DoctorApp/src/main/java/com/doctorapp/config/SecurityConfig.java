package com.doctorapp.config;

import com.doctorapp.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // PUBLIC - Login & Registration
                        .requestMatchers("/api/users/login", "/api/users/register/**").permitAll()
                        .requestMatchers("/api/users/forgot-password", "/api/users/reset-password").permitAll()

                        // PUBLIC - Swagger UI & API docs
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**")
                        .permitAll()

                        // PUBLIC - Doctor listing & feedback (for public pages)
                        .requestMatchers(HttpMethod.GET, "/api/doctors", "/api/doctors/search",
                                "/api/doctors/speciality/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/*/public").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/feedbacks/by-doctor/**").permitAll()

                        // PATIENT endpoints
                        .requestMatchers(HttpMethod.POST, "/api/appointments/book").hasRole("PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/by-patient/**").hasRole("PATIENT")
                        .requestMatchers(HttpMethod.POST, "/api/feedbacks/add").hasRole("PATIENT")

                        // NOTIFICATION endpoints - any authenticated user
                        .requestMatchers("/api/notifications/**").authenticated()

                        // DOCUMENT endpoints
                        .requestMatchers(HttpMethod.POST, "/api/documents/upload").hasRole("PATIENT")
                        .requestMatchers(HttpMethod.POST, "/api/documents/doctor/upload").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/documents/doctor/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/documents/**")
                        .hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/documents/**").authenticated()

                        // MEDICINE endpoints
                        .requestMatchers(HttpMethod.POST, "/api/medicines/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/medicines/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/medicines/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/medicines/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/appointments/by-doctor/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/patients/by-doctor/**").hasAnyRole("DOCTOR", "ADMIN")

                        // Appointment management
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/*/approve").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/*/reject").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/*/confirm").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/*/cancel")
                        .hasAnyRole("DOCTOR", "ADMIN", "PATIENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").hasRole("ADMIN")

                        // ADMIN endpoints - patient CRUD
                        .requestMatchers(HttpMethod.POST, "/api/patients/*/photo").hasAnyRole("PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/patients/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/update").hasAnyRole("PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasRole("ADMIN")

                        // ADMIN endpoints - doctor CRUD
                        .requestMatchers(HttpMethod.POST, "/api/doctors/*/photo").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/doctors/add").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/doctors/update").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctors/remove").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/doctors/availability/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/doctors/availability/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctors/availability/**")
                        .hasAnyRole("DOCTOR", "ADMIN")

                        // Doctor send-email
                        .requestMatchers(HttpMethod.POST, "/api/doctors/send-email").hasRole("DOCTOR")

                        // ADMIN endpoints - admin CRUD
                        .requestMatchers("/api/admins/**").hasRole("ADMIN")

                        // READ endpoints - any authenticated user
                        .requestMatchers(HttpMethod.GET, "/api/doctors/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/patients/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/feedbacks/**").authenticated()

                        // Everything else requires authentication
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
