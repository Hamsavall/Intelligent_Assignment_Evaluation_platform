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