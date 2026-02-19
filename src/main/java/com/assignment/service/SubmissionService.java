package com.assignment.service;

import com.assignment.dto.SubmissionRequest;
import com.assignment.model.Submission;
import com.assignment.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AIEvaluationService aiEvaluationService;

    public List<Submission> getStudentSubmissions(UUID studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public List<Submission> getSubmissionsByAssignment(UUID assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public Submission getSubmissionById(UUID id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    public Submission createSubmission(SubmissionRequest request, UUID studentId) {
        Submission submission = new Submission();
        submission.setAssignmentId(UUID.fromString(request.getAssignment_id()));
        submission.setStudentId(studentId);
        submission.setContent(request.getContent());
        submission.setFileUrl(request.getFile_url());
        submission.setStatus(Submission.SubmissionStatus.pending);

        submission = submissionRepository.save(submission);

        aiEvaluationService.evaluateSubmission(submission);

        return submission;
    }
}