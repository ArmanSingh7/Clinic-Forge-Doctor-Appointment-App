package com.doctorapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI doctorAppOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Doctor Appointment Application API")
                        .description("REST API documentation for the Doctor Appointment monolithic Spring Boot application. " +
                                "Covers Login, Patient, Doctor, Appointment, Feedback and Admin modules.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Doctor App Team")
                                .email("admin@doctorapp.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ));
    }
}
