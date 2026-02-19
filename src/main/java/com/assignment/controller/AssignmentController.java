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