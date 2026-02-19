/*
  # Assignment Evaluation Platform Schema

  ## Overview
  This migration creates the complete database schema for an intelligent assignment 
  evaluation and feedback platform with role-based access control.

  ## New Tables
  
  ### 1. `user_profiles`
  Extends auth.users with role information and profile data
  - `id` (uuid, primary key, references auth.users)
  - `role` (text, either 'student' or 'instructor')
  - `full_name` (text)
  - `created_at` (timestamptz)
  
  ### 2. `assignments`
  Stores assignment details created by instructors
  - `id` (uuid, primary key)
  - `instructor_id` (uuid, references user_profiles)
  - `title` (text)
  - `description` (text)
  - `due_date` (timestamptz)
  - `max_score` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. `submissions`
  Stores student assignment submissions
  - `id` (uuid, primary key)
  - `assignment_id` (uuid, references assignments)
  - `student_id` (uuid, references user_profiles)
  - `content` (text, the assignment text content)
  - `file_url` (text, optional file upload URL)
  - `status` (text, pending/evaluated)
  - `submitted_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. `evaluations`
  Stores AI-generated evaluation results and feedback
  - `id` (uuid, primary key)
  - `submission_id` (uuid, references submissions)
  - `score` (integer)
  - `plagiarism_risk` (numeric, percentage 0-100)
  - `feedback_summary` (text)
  - `detailed_feedback` (jsonb, structured feedback)
  - `evaluated_at` (timestamptz)

  ## Security
  All tables have Row Level Security (RLS) enabled with appropriate policies:
  - Students can only access their own submissions and evaluations
  - Instructors can access all submissions for their assignments
  - Users can only read their own profiles
  - Only authenticated users can interact with the system
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('student', 'instructor')),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  due_date timestamptz NOT NULL,
  max_score integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'instructor'
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

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  file_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated')),
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
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

CREATE POLICY "Students can create own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'student'
    )
  );

CREATE POLICY "Students can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  plagiarism_risk numeric NOT NULL CHECK (plagiarism_risk >= 0 AND plagiarism_risk <= 100),
  feedback_summary text NOT NULL,
  detailed_feedback jsonb DEFAULT '{}'::jsonb,
  evaluated_at timestamptz DEFAULT now()
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view evaluations for own submissions"
  ON evaluations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = evaluations.submission_id
      AND submissions.student_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view evaluations for their assignments"
  ON evaluations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM submissions
      JOIN assignments ON assignments.id = submissions.assignment_id
      WHERE submissions.id = evaluations.submission_id
      AND assignments.instructor_id = auth.uid()
    )
  );

CREATE POLICY "System can insert evaluations"
  ON evaluations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_instructor ON assignments(instructor_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_submission ON evaluations(submission_id);