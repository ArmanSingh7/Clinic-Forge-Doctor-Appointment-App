package com.doctorapp.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    // A 256-bit (32 byte) secret for HS256
    private static final String SECRET = "ThisIsASecretKeyForTestingPurpose123456";
    private static final long EXPIRATION_MS = 86400000L;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION_MS);
    }

    @Nested
    @DisplayName("Token Generation")
    class TokenGenerationTests {

        @Test
        @DisplayName("Should generate a valid JWT token")
        void shouldGenerateToken() {
            String token = jwtUtil.generateToken(1, "testuser", "PATIENT", 10);

            assertThat(token).isNotNull();
            assertThat(token).isNotEmpty();
            assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
        }

        @Test
        @DisplayName("Should generate token with correct claims")
        void shouldContainCorrectClaims() {
            String token = jwtUtil.generateToken(1, "testuser", "DOCTOR", 5);

            assertThat(jwtUtil.getUserName(token)).isEqualTo("testuser");
            assertThat(jwtUtil.getRole(token)).isEqualTo("DOCTOR");
            assertThat(jwtUtil.getUserId(token)).isEqualTo(1);
            assertThat(jwtUtil.getProfileId(token)).isEqualTo(5);
        }
    }

    @Nested
    @DisplayName("Token Validation")
    class TokenValidationTests {

        @Test
        @DisplayName("Should validate a correct token")
        void shouldValidateCorrectToken() {
            String token = jwtUtil.generateToken(1, "testuser", "PATIENT", 10);

            assertThat(jwtUtil.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("Should reject a tampered token")
        void shouldRejectTamperedToken() {
            String token = jwtUtil.generateToken(1, "testuser", "PATIENT", 10);
            String tampered = token + "tampered";

            assertThat(jwtUtil.validateToken(tampered)).isFalse();
        }

        @Test
        @DisplayName("Should reject a random string as token")
        void shouldRejectRandomString() {
            assertThat(jwtUtil.validateToken("not.a.valid.jwt")).isFalse();
        }

        @Test
        @DisplayName("Should reject an expired token")
        void shouldRejectExpiredToken() {
            // Create JwtUtil with 0ms expiration
            JwtUtil expiredJwtUtil = new JwtUtil(SECRET, 0L);
            String token = expiredJwtUtil.generateToken(1, "testuser", "PATIENT", 10);

            assertThat(expiredJwtUtil.validateToken(token)).isFalse();
        }
    }

    @Nested
    @DisplayName("Claim Extraction")
    class ClaimExtractionTests {

        @Test
        @DisplayName("Should extract username from token")
        void shouldExtractUsername() {
            String token = jwtUtil.generateToken(1, "admin", "ADMIN", 1);

            assertThat(jwtUtil.getUserName(token)).isEqualTo("admin");
        }

        @Test
        @DisplayName("Should extract role from token")
        void shouldExtractRole() {
            String token = jwtUtil.generateToken(1, "admin", "ADMIN", 1);

            assertThat(jwtUtil.getRole(token)).isEqualTo("ADMIN");
        }

        @Test
        @DisplayName("Should extract userId from token")
        void shouldExtractUserId() {
            String token = jwtUtil.generateToken(42, "user42", "PATIENT", 99);

            assertThat(jwtUtil.getUserId(token)).isEqualTo(42);
        }

        @Test
        @DisplayName("Should extract profileId from token")
        void shouldExtractProfileId() {
            String token = jwtUtil.generateToken(1, "user", "DOCTOR", 77);

            assertThat(jwtUtil.getProfileId(token)).isEqualTo(77);
        }

        @Test
        @DisplayName("Should extract all claims")
        void shouldExtractAllClaims() {
            String token = jwtUtil.generateToken(5, "multiuser", "PATIENT", 15);

            Claims claims = jwtUtil.getClaims(token);

            assertThat(claims.getSubject()).isEqualTo("multiuser");
            assertThat(claims.get("userId", Integer.class)).isEqualTo(5);
            assertThat(claims.get("role", String.class)).isEqualTo("PATIENT");
            assertThat(claims.get("profileId", Integer.class)).isEqualTo(15);
            assertThat(claims.getExpiration()).isNotNull();
            assertThat(claims.getIssuedAt()).isNotNull();
        }
    }
}
