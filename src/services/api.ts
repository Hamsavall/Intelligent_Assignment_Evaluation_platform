import { User, Assignment, Submission, Feedback, SubmissionWithFeedback } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (email: string, password: string, fullName: string, role: 'student' | 'instructor'): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get user');
    return response.json();
  },
};

export const assignmentsApi = {
  getAll: async (): Promise<Assignment[]> => {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  },

  getById: async (id: string): Promise<Assignment> => {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch assignment');
    return response.json();
  },

  create: async (data: Omit<Assignment, 'id' | 'instructor_id' | 'created_at'>): Promise<Assignment> => {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create assignment');
    return response.json();
  },

  getInstructorAssignments: async (): Promise<Assignment[]> => {
    const response = await fetch(`${API_BASE_URL}/assignments/instructor`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch instructor assignments');
    return response.json();
  },
};

export const submissionsApi = {
  getStudentSubmissions: async (): Promise<SubmissionWithFeedback[]> => {
    const response = await fetch(`${API_BASE_URL}/submissions/student`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },

  getByAssignment: async (assignmentId: string): Promise<SubmissionWithFeedback[]> => {
    const response = await fetch(`${API_BASE_URL}/submissions/assignment/${assignmentId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },

  create: async (assignmentId: string, content: string, fileUrl?: string): Promise<Submission> => {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ assignment_id: assignmentId, content, file_url: fileUrl }),
    });
    if (!response.ok) throw new Error('Failed to create submission');
    return response.json();
  },

  getById: async (id: string): Promise<SubmissionWithFeedback> => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch submission');
    return response.json();
  },
};

export const feedbackApi = {
  getBySubmission: async (submissionId: string): Promise<Feedback> => {
    const response = await fetch(`${API_BASE_URL}/feedback/submission/${submissionId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },
};
