/*
  # Assignment Evaluation Platform Schema

  1. New Tables
    - profiles: User profiles with role (student/instructor)
    - assignments: Assignments created by instructors
    - submissions: Student submissions for assignments
    - feedback: AI-generated feedback and scores

  2. Security
    - Enable RLS on all tables
    - Students can view their own data
    - Instructors can view submissions for their assignments
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'instructor')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  due_date timestamptz NOT NULL,
  max_score integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors can create assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'instructor'
    )
  );

CREATE POLICY "Instructors can update own assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can delete own assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (instructor_id = auth.uid());

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  file_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated', 'reviewed')),
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Instructors can view submissions for their assignments"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = submissions.assignment_id
      AND assignments.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'student'
    )
  );

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  plagiarism_risk numeric NOT NULL DEFAULT 0,
  feedback_summary text NOT NULL,
  score integer NOT NULL,
  detailed_feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view feedback for own submissions"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = feedback.submission_id
      AND submissions.student_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view feedback for their assignments"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      JOIN assignments ON assignments.id = submissions.assignment_id
      WHERE submissions.id = feedback.submission_id
      AND assignments.instructor_id = auth.uid()
    )
  );

CREATE POLICY "System can insert feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);
