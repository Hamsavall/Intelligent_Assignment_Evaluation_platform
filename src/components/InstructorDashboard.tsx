import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Assignment, SubmissionWithFeedback } from '../types';
import { assignmentsApi, submissionsApi } from '../services/api';
import { LogOut, Plus, Users, FileText, Award } from 'lucide-react';

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithFeedback[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    max_score: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadSubmissions(selectedAssignment.id);
    }
  }, [selectedAssignment]);

  const loadAssignments = async () => {
    try {
      const data = await assignmentsApi.getInstructorAssignments();
      setAssignments(data);
    } catch (err) {
      setError('Failed to load assignments');
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    try {
      const data = await submissionsApi.getByAssignment(assignmentId);
      setSubmissions(data);
    } catch (err) {
      setError('Failed to load submissions');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await assignmentsApi.create(formData);
      setSuccess('Assignment created successfully!');
      setFormData({ title: '', description: '', due_date: '', max_score: 100 });
      setShowCreateForm(false);
      await loadAssignments();
    } catch (err) {
      setError('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Instructor Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.full_name}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">My Assignments</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Data Structures - Week 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed instructions for the assignment..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Assignment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Assignments</h3>
            <div className="space-y-2">
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-sm">No assignments created yet</p>
              ) : (
                assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => setSelectedAssignment(assignment)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAssignment?.id === assignment.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-800 text-sm">{assignment.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedAssignment ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">{selectedAssignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{selectedAssignment.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>Due: {new Date(selectedAssignment.due_date).toLocaleString()}</span>
                    <span>Max Score: {selectedAssignment.max_score}</span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-800">Submissions ({submissions.length})</h4>
                  </div>

                  <div className="space-y-4">
                    {submissions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No submissions yet</p>
                      </div>
                    ) : (
                      submissions.map((submission) => (
                        <div key={submission.id} className="border border-gray-200 rounded-lg p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-800">Student ID: {submission.student_id.slice(0, 8)}...</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Submitted: {new Date(submission.submitted_at).toLocaleString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              submission.status === 'evaluated' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {submission.status}
                            </span>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-700 line-clamp-3">{submission.content}</p>
                          </div>

                          {submission.feedback ? (
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">AI Feedback</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-semibold text-blue-700">
                                    Score: {submission.feedback.score}/{selectedAssignment.max_score}
                                  </span>
                                  <span className="text-sm font-semibold text-orange-700">
                                    Plagiarism: {submission.feedback.plagiarism_risk.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-blue-800">{submission.feedback.feedback_summary}</p>
                              {submission.feedback.detailed_feedback && (
                                <p className="text-xs text-blue-700 mt-2 border-t border-blue-200 pt-2">
                                  {submission.feedback.detailed_feedback}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                              <p className="text-sm text-yellow-800">Awaiting AI evaluation...</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select an assignment to view submissions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
