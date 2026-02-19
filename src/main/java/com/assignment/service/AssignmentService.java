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