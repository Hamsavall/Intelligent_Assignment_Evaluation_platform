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