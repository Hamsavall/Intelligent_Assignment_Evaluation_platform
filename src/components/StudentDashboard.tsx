import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Assignment, SubmissionWithFeedback } from '../types';
import { assignmentsApi, submissionsApi } from '../services/api';
import { LogOut, Send, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithFeedback[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, submissionsData] = await Promise.all([
        assignmentsApi.getAll(),
        submissionsApi.getStudentSubmissions(),
      ]);
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await submissionsApi.create(selectedAssignment.id, content);
      setSuccess('Assignment submitted successfully!');
      setContent('');
      setSelectedAssignment(null);
      await loadData();
    } catch (err) {
      setError('Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'evaluated': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'evaluated': return <AlertCircle className="w-4 h-4" />;
      case 'reviewed': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
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
        <div className="mb-6">
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'submit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Submit Assignment
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'view'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              View Submissions
            </button>
          </div>
        </div>

        {activeTab === 'submit' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Assignments</h2>
              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No assignments available</p>
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
                      <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                        <span>Max Score: {assignment.max_score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit Your Work</h2>
              {selectedAssignment ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      {selectedAssignment.title}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {selectedAssignment.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer
                    </label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Type your answer here..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select an assignment to submit your work</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">My Submissions</h2>
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No submissions yet</p>
              ) : (
                submissions.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {submission.assignment?.title || 'Assignment'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="text-sm text-gray-700">{submission.content}</p>
                    </div>

                    {submission.feedback && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-900">Feedback</h4>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-blue-700">
                              Score: {submission.feedback.score}/{submission.assignment?.max_score || 100}
                            </span>
                            <span className="text-sm font-medium text-orange-700">
                              Plagiarism Risk: {submission.feedback.plagiarism_risk.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-blue-800 mb-2">{submission.feedback.feedback_summary}</p>
                        {submission.feedback.detailed_feedback && (
                          <p className="text-xs text-blue-700 mt-2">{submission.feedback.detailed_feedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
