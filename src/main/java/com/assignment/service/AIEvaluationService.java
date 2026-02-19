package com.assignment.service;

import com.assignment.model.Feedback;
import com.assignment.model.Submission;
import com.assignment.repository.FeedbackRepository;
import com.assignment.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Random;

@Service
public class AIEvaluationService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Async
    public void evaluateSubmission(Submission submission) {
        double plagiarismRisk = calculatePlagiarismRisk(submission.getContent());

        String feedbackSummary = generateFeedback(submission.getContent());

        int score = calculateScore(submission.getContent(), plagiarismRisk);

        Feedback feedback = new Feedback();
        feedback.setSubmissionId(submission.getId());
        feedback.setPlagiarismRisk(plagiarismRisk);
        feedback.setFeedbackSummary(feedbackSummary);
        feedback.setScore(score);
        feedback.setDetailedFeedback(generateDetailedFeedback(submission.getContent()));

        feedbackRepository.save(feedback);

        submission.setStatus(Submission.SubmissionStatus.evaluated);
        submissionRepository.save(submission);
    }

    private double calculatePlagiarismRisk(String content) {
        int wordCount = content.split("\\s+").length;

        if (wordCount < 50) {
            return Math.random() * 15;
        } else if (wordCount < 150) {
            return Math.random() * 25;
        } else {
            return Math.random() * 40;
        }
    }

    private String generateFeedback(String content) {
        int wordCount = content.split("\\s+").length;

        if (wordCount < 50) {
            return "The submission is too brief. Please provide more detailed explanations and examples.";
        } else if (wordCount < 100) {
            return "Good attempt, but the explanation could be more comprehensive. Consider adding more details.";
        } else if (wordCount < 200) {
            return "Well-structured response with good coverage of the topic. Some sections could be elaborated further.";
        } else {
            return "Excellent comprehensive response with detailed explanations and good structure.";
        }
    }

    private int calculateScore(String content, double plagiarismRisk) {
        int wordCount = content.split("\\s+").length;
        int baseScore = Math.min(100, wordCount / 2);

        int plagiarismPenalty = (int) (plagiarismRisk / 2);

        return Math.max(0, baseScore - plagiarismPenalty);
    }

    private String generateDetailedFeedback(String content) {
        return "Content analysis shows good understanding. Continue to develop your explanations with more specific examples and references.";
    }

    public Feedback getFeedbackBySubmission(java.util.UUID submissionId) {
        return feedbackRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
    }
}