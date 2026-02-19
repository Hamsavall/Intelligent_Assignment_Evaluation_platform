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