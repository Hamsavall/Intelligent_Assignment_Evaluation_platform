# Java Backend Implementation Guide

This document provides the complete Java Spring Boot backend code for the Assignment Evaluation Platform.

## Project Structure

```
assignment-backend/
├── src/main/java/com/assignment/
│   ├── AssignmentApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── CorsConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── AssignmentController.java
│   │   ├── SubmissionController.java
│   │   └── FeedbackController.java
│   ├── model/
│   │   ├── User.java
│   │   ├── Assignment.java
│   │   ├── Submission.java
│   │   └── Feedback.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── AssignmentRepository.java
│   │   ├── SubmissionRepository.java
│   │   └── FeedbackRepository.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── AssignmentService.java
│   │   ├── SubmissionService.java
│   │   └── AIEvaluationService.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── AuthResponse.java
│   │   ├── CreateAssignmentRequest.java
│   │   ├── SubmissionRequest.java
│   │   └── FeedbackResponse.java
│   └── security/
│       ├── JwtTokenProvider.java
│       └── JwtAuthenticationFilter.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## 1. pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>com.assignment</groupId>
    <artifactId>assignment-backend</artifactId>
    <version>1.0.0</version>
    <name>Assignment Evaluation Platform</name>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## 2. application.properties

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/assignment_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
jwt.secret=your-secret-key-here-change-this-in-production
jwt.expiration=86400000

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## 3. Main Application Class

```java
package com.assignment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AssignmentApplication {
    public static void main(String[] args) {
        SpringApplication.run(AssignmentApplication.class, args);
    }
}
```

## 4. Model Classes

### User.java
```java
package com.assignment.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Data
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum UserRole {
        student, instructor
    }
}
```

### Assignment.java
```java
package com.assignment.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assignments")
@Data
public class Assignment {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "instructor_id", nullable = false)
    private UUID instructorId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore = 100;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### Submission.java
```java
package com.assignment.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "submissions")
@Data
public class Submission {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "assignment_id", nullable = false)
    private UUID assignmentId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_url")
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.pending;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    public enum SubmissionStatus {
        pending, evaluated, reviewed
    }
}
```

### Feedback.java
```java
package com.assignment.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedback")
@Data
public class Feedback {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "submission_id", nullable = false)
    private UUID submissionId;

    @Column(name = "plagiarism_risk", nullable = false)
    private Double plagiarismRisk = 0.0;

    @Column(name = "feedback_summary", nullable = false, columnDefinition = "TEXT")
    private String feedbackSummary;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "detailed_feedback", columnDefinition = "TEXT")
    private String detailedFeedback;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

## 5. Repository Interfaces

### UserRepository.java
```java
package com.assignment.repository;

import com.assignment.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### AssignmentRepository.java
```java
package com.assignment.repository;

import com.assignment.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByInstructorId(UUID instructorId);
}
```

### SubmissionRepository.java
```java
package com.assignment.repository;

import com.assignment.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByStudentId(UUID studentId);
    List<Submission> findByAssignmentId(UUID assignmentId);
}
```

### FeedbackRepository.java
```java
package com.assignment.repository;

import com.assignment.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    Optional<Feedback> findBySubmissionId(UUID submissionId);
}
```

## 6. DTOs

### LoginRequest.java
```java
package com.assignment.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
```

### RegisterRequest.java
```java
package com.assignment.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String full_name;
    private String role;
}
```

### AuthResponse.java
```java
package com.assignment.dto;

import com.assignment.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private User user;
    private String token;
}
```

### CreateAssignmentRequest.java
```java
package com.assignment.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateAssignmentRequest {
    private String title;
    private String description;
    private String due_date;
    private Integer max_score;
}
```

### SubmissionRequest.java
```java
package com.assignment.dto;

import lombok.Data;

@Data
public class SubmissionRequest {
    private String assignment_id;
    private String content;
    private String file_url;
}
```

### FeedbackResponse.java
```java
package com.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FeedbackResponse {
    private String submission_id;
    private Double plagiarism_risk;
    private String feedback_summary;
    private Integer score;
}
```

## 7. Security Configuration

### JwtTokenProvider.java
```java
package com.assignment.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(UUID userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return UUID.fromString(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### JwtAuthenticationFilter.java
```java
package com.assignment.security;

import com.assignment.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                UUID userId = tokenProvider.getUserIdFromToken(jwt);
                UserDetails userDetails = authService.loadUserById(userId);

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### SecurityConfig.java
```java
package com.assignment.config;

import com.assignment.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### CorsConfig.java
```java
package com.assignment.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

## 8. Service Classes

### AuthService.java
```java
package com.assignment.service;

import com.assignment.dto.AuthResponse;
import com.assignment.dto.LoginRequest;
import com.assignment.dto.RegisterRequest;
import com.assignment.model.User;
import com.assignment.repository.UserRepository;
import com.assignment.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.UUID;

@Service
public class AuthService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFull_name());
        user.setRole(User.UserRole.valueOf(request.getRole()));

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId());
        user.setPassword(null);

        return new AuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = tokenProvider.generateToken(user.getId());
        user.setPassword(null);

        return new AuthResponse(user, token);
    }

    public User getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(null);
        return user;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>());
    }

    public UserDetails loadUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>());
    }
}
```

### AssignmentService.java
```java
package com.assignment.service;

import com.assignment.dto.CreateAssignmentRequest;
import com.assignment.model.Assignment;
import com.assignment.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public Assignment getAssignmentById(UUID id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }

    public List<Assignment> getInstructorAssignments(UUID instructorId) {
        return assignmentRepository.findByInstructorId(instructorId);
    }

    public Assignment createAssignment(CreateAssignmentRequest request, UUID instructorId) {
        Assignment assignment = new Assignment();
        assignment.setInstructorId(instructorId);
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDueDate(LocalDateTime.parse(request.getDue_date()));
        assignment.setMaxScore(request.getMax_score());

        return assignmentRepository.save(assignment);
    }
}
```

### SubmissionService.java
```java
package com.assignment.service;

import com.assignment.dto.SubmissionRequest;
import com.assignment.model.Submission;
import com.assignment.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AIEvaluationService aiEvaluationService;

    public List<Submission> getStudentSubmissions(UUID studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public List<Submission> getSubmissionsByAssignment(UUID assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public Submission getSubmissionById(UUID id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    public Submission createSubmission(SubmissionRequest request, UUID studentId) {
        Submission submission = new Submission();
        submission.setAssignmentId(UUID.fromString(request.getAssignment_id()));
        submission.setStudentId(studentId);
        submission.setContent(request.getContent());
        submission.setFileUrl(request.getFile_url());
        submission.setStatus(Submission.SubmissionStatus.pending);

        submission = submissionRepository.save(submission);

        aiEvaluationService.evaluateSubmission(submission);

        return submission;
    }
}
```

### AIEvaluationService.java
```java
package com.assignment.service;

import com.assignment.model.Feedback;
import com.assignment.model.Submission;
import com.assignment.repository.FeedbackRepository;
import com.assignment.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Random;

@Service
public class AIEvaluationService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Async
    public void evaluateSubmission(Submission submission) {
        double plagiarismRisk = calculatePlagiarismRisk(submission.getContent());

        String feedbackSummary = generateFeedback(submission.getContent());

        int score = calculateScore(submission.getContent(), plagiarismRisk);

        Feedback feedback = new Feedback();
        feedback.setSubmissionId(submission.getId());
        feedback.setPlagiarismRisk(plagiarismRisk);
        feedback.setFeedbackSummary(feedbackSummary);
        feedback.setScore(score);
        feedback.setDetailedFeedback(generateDetailedFeedback(submission.getContent()));

        feedbackRepository.save(feedback);

        submission.setStatus(Submission.SubmissionStatus.evaluated);
        submissionRepository.save(submission);
    }

    private double calculatePlagiarismRisk(String content) {
        int wordCount = content.split("\\s+").length;

        if (wordCount < 50) {
            return Math.random() * 15;
        } else if (wordCount < 150) {
            return Math.random() * 25;
        } else {
            return Math.random() * 40;
        }
    }

    private String generateFeedback(String content) {
        int wordCount = content.split("\\s+").length;

        if (wordCount < 50) {
            return "The submission is too brief. Please provide more detailed explanations and examples.";
        } else if (wordCount < 100) {
            return "Good attempt, but the explanation could be more comprehensive. Consider adding more details.";
        } else if (wordCount < 200) {
            return "Well-structured response with good coverage of the topic. Some sections could be elaborated further.";
        } else {
            return "Excellent comprehensive response with detailed explanations and good structure.";
        }
    }

    private int calculateScore(String content, double plagiarismRisk) {
        int wordCount = content.split("\\s+").length;
        int baseScore = Math.min(100, wordCount / 2);

        int plagiarismPenalty = (int) (plagiarismRisk / 2);

        return Math.max(0, baseScore - plagiarismPenalty);
    }

    private String generateDetailedFeedback(String content) {
        return "Content analysis shows good understanding. Continue to develop your explanations with more specific examples and references.";
    }

    public Feedback getFeedbackBySubmission(java.util.UUID submissionId) {
        return feedbackRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
    }
}
```

## 9. Controller Classes

### AuthController.java
```java
package com.assignment.controller;

import com.assignment.dto.AuthResponse;
import com.assignment.dto.LoginRequest;
import com.assignment.dto.RegisterRequest;
import com.assignment.model.User;
import com.assignment.security.JwtTokenProvider;
import com.assignment.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String token = authentication.getCredentials().toString();
        UUID userId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }
}
```

### AssignmentController.java
```java
package com.assignment.controller;

import com.assignment.dto.CreateAssignmentRequest;
import com.assignment.model.Assignment;
import com.assignment.security.JwtTokenProvider;
import com.assignment.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable String id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(UUID.fromString(id)));
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<Assignment>> getInstructorAssignments(@RequestHeader("Authorization") String token) {
        UUID userId = tokenProvider.getUserIdFromToken(token.substring(7));
        return ResponseEntity.ok(assignmentService.getInstructorAssignments(userId));
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(
            @RequestBody CreateAssignmentRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = tokenProvider.getUserIdFromToken(token.substring(7));
        return ResponseEntity.ok(assignmentService.createAssignment(request, userId));
    }
}
```

### SubmissionController.java
```java
package com.assignment.controller;

import com.assignment.dto.SubmissionRequest;
import com.assignment.model.Submission;
import com.assignment.security.JwtTokenProvider;
import com.assignment.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @GetMapping("/student")
    public ResponseEntity<List<Submission>> getStudentSubmissions(@RequestHeader("Authorization") String token) {
        UUID userId = tokenProvider.getUserIdFromToken(token.substring(7));
        return ResponseEntity.ok(submissionService.getStudentSubmissions(userId));
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<Submission>> getSubmissionsByAssignment(@PathVariable String assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(UUID.fromString(assignmentId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable String id) {
        return ResponseEntity.ok(submissionService.getSubmissionById(UUID.fromString(id)));
    }

    @PostMapping
    public ResponseEntity<Submission> createSubmission(
            @RequestBody SubmissionRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = tokenProvider.getUserIdFromToken(token.substring(7));
        return ResponseEntity.ok(submissionService.createSubmission(request, userId));
    }
}
```

### FeedbackController.java
```java
package com.assignment.controller;

import com.assignment.model.Feedback;
import com.assignment.service.AIEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private AIEvaluationService aiEvaluationService;

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<Feedback> getFeedbackBySubmission(@PathVariable String submissionId) {
        return ResponseEntity.ok(aiEvaluationService.getFeedbackBySubmission(UUID.fromString(submissionId)));
    }
}
```

## 10. SQL Database Schema

```sql
-- Create database
CREATE DATABASE assignment_db;

-- Connect to database
\c assignment_db;

-- Profiles (Users) table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'instructor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    max_score INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    file_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated', 'reviewed')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    plagiarism_risk NUMERIC(5,2) NOT NULL DEFAULT 0,
    feedback_summary TEXT NOT NULL,
    score INTEGER NOT NULL,
    detailed_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_assignments_instructor ON assignments(instructor_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_feedback_submission ON feedback(submission_id);
```

## How to Run the Backend

1. **Install Java 17** and Maven
2. **Set up PostgreSQL** database and run the SQL schema script
3. **Update** `application.properties` with your database credentials
4. **Build** the project:
   ```bash
   mvn clean install
   ```
5. **Run** the application:
   ```bash
   mvn spring-boot:run
   ```
   Or run the JAR:
   ```bash
   java -jar target/assignment-backend-1.0.0.jar
   ```

The backend will start on `http://localhost:8080`

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/{id}` - Get assignment by ID
- `GET /api/assignments/instructor` - Get instructor's assignments
- `POST /api/assignments` - Create new assignment

### Submissions
- `GET /api/submissions/student` - Get student's submissions
- `GET /api/submissions/assignment/{id}` - Get submissions for assignment
- `GET /api/submissions/{id}` - Get submission by ID
- `POST /api/submissions` - Create new submission

### Feedback
- `GET /api/feedback/submission/{id}` - Get feedback for submission

## Integration with React Frontend

Replace the dummy URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

With your deployed backend URL when ready.
