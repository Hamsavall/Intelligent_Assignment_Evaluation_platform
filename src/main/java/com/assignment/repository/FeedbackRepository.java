package com.assignment.repository;

import com.assignment.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    Optional<Feedback> findBySubmissionId(UUID submissionId);
}