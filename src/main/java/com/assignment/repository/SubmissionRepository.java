package com.assignment.repository;

import com.assignment.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByStudentId(UUID studentId);
    List<Submission> findByAssignmentId(UUID assignmentId);
}