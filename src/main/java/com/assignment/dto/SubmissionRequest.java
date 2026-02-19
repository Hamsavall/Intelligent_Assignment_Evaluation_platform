package com.assignment.dto;

import lombok.Data;

@Data
public class SubmissionRequest {
    private String assignment_id;
    private String content;
    private String file_url;
}