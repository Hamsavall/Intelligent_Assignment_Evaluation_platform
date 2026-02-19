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