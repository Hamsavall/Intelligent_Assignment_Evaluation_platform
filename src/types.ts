export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor';
  created_at: string;
}

export interface Assignment {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  file_url?: string;
  status: 'pending' | 'evaluated' | 'reviewed';
  submitted_at: string;
  assignment?: Assignment;
}

export interface Feedback {
  id: string;
  submission_id: string;
  plagiarism_risk: number;
  feedback_summary: string;
  score: number;
  detailed_feedback?: string;
  created_at: string;
}

export interface SubmissionWithFeedback extends Submission {
  feedback?: Feedback;
}
