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