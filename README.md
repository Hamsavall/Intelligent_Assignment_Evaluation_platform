# Intelligent Assignment Evaluation & Feedback Platform

A full-stack web platform where students submit assignments and instructors receive automated evaluation, feedback, and plagiarism risk analysis.

## Features

### Student Dashboard
- Submit assignments (text-based)
- View submission status
- View AI-generated feedback and scores
- Track plagiarism risk for each submission

### Instructor Dashboard
- Create assignments with titles, descriptions, due dates, and max scores
- View all student submissions
- Review AI-generated feedback for each submission
- Monitor plagiarism risk across all submissions

### AI/ML Component
- Automated plagiarism risk detection (0-100%)
- Intelligent feedback generation based on content length and quality
- Automated scoring system
- Detailed feedback for students

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

### Backend (Java Spring Boot)
- Complete implementation provided in `JAVA_BACKEND.md`
- REST API with JWT authentication
- PostgreSQL database
- Async AI evaluation service

### Database
- Supabase (PostgreSQL) - Already configured and set up
- Tables: profiles, assignments, submissions, feedback

## Getting Started

### Frontend Setup

The frontend is already configured and ready to run. Currently, it uses dummy API URLs that you'll need to replace with your backend URLs.

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Backend Setup

Complete Java Spring Boot backend code is provided in the `JAVA_BACKEND.md` file. Follow these steps:

1. **Prerequisites:**
   - Install Java 17 or higher
   - Install Maven
   - Install PostgreSQL

2. **Database Setup:**
   - Create a PostgreSQL database named `assignment_db`
   - Run the SQL schema provided in `JAVA_BACKEND.md` (Section 10)

3. **Configure Backend:**
   - Update `application.properties` with your database credentials
   - Change the JWT secret key in production

4. **Run Backend:**
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`

### Connecting Frontend to Backend

Once your Java backend is running, update the API base URL in the frontend:

**File:** `src/services/api.ts`

```typescript
// Change this line:
const API_BASE_URL = 'http://localhost:8080/api';

// To your deployed backend URL:
const API_BASE_URL = 'https://your-backend-url.com/api';
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/{id}` - Get assignment by ID
- `GET /api/assignments/instructor` - Get instructor's assignments
- `POST /api/assignments` - Create new assignment (instructor only)

### Submissions
- `GET /api/submissions/student` - Get student's submissions
- `GET /api/submissions/assignment/{id}` - Get submissions for assignment
- `GET /api/submissions/{id}` - Get submission by ID
- `POST /api/submissions` - Create new submission (student only)

### Feedback
- `GET /api/feedback/submission/{id}` - Get feedback for submission

## AI/ML Implementation

The AI evaluation service uses:

1. **Plagiarism Detection:**
   - Simple word count-based risk calculation
   - Shorter submissions get lower risk scores
   - Longer submissions have higher potential risk
   - Range: 0-40%

2. **Feedback Generation:**
   - Rule-based system analyzing content length
   - Provides constructive feedback based on word count
   - Encourages students to provide more detail

3. **Scoring System:**
   - Base score calculated from word count
   - Plagiarism penalty applied to final score
   - Score range: 0-100

**Note:** This is a basic implementation. For production, consider integrating:
- Advanced NLP libraries (Stanford NLP, OpenNLP)
- LLM APIs (OpenAI GPT, Google PaLM)
- Specialized plagiarism detection services
- TF-IDF with cosine similarity for more accurate detection

## Database Schema

The Supabase database includes:

- **profiles** - User accounts with roles (student/instructor)
- **assignments** - Assignments created by instructors
- **submissions** - Student submissions for assignments
- **feedback** - AI-generated feedback and scores

All tables have Row Level Security (RLS) policies enabled to ensure data privacy.

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Vite configuration
3. Deploy with one click
4. Update `API_BASE_URL` with your production backend URL

### Backend
Deploy to:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Platform
- DigitalOcean App Platform

Make sure to:
- Set environment variables for database and JWT secret
- Enable CORS for your frontend domain
- Use HTTPS in production

## Usage Flow

### For Students:
1. Register/Login with role "student"
2. View available assignments
3. Select an assignment and submit your work
4. Wait for AI evaluation (happens automatically)
5. View feedback, score, and plagiarism risk

### For Instructors:
1. Register/Login with role "instructor"
2. Create assignments with details and due dates
3. View all assignments in the left panel
4. Select an assignment to see student submissions
5. Review AI-generated feedback for each submission
6. Monitor plagiarism risk across all submissions

## Example Output

When a student submits an assignment, the system generates:

```json
{
  "submission_id": "550e8400-e29b-41d4-a716-446655440000",
  "plagiarism_risk": "22.5%",
  "feedback_summary": "Well-structured response with good coverage of the topic. Some sections could be elaborated further.",
  "score": 68,
  "detailed_feedback": "Content analysis shows good understanding. Continue to develop your explanations with more specific examples and references."
}
```

## Project Structure

```
src/
├── components/
│   ├── Auth.tsx              # Login/Register component
│   ├── StudentDashboard.tsx  # Student interface
│   └── InstructorDashboard.tsx # Instructor interface
├── context/
│   └── AuthContext.tsx       # Authentication state management
├── services/
│   └── api.ts                # API service layer with dummy URLs
├── types.ts                  # TypeScript type definitions
├── App.tsx                   # Main app with routing
├── main.tsx                  # App entry point
└── index.css                 # Global styles with Tailwind

JAVA_BACKEND.md              # Complete Java backend code
README.md                    # This file
```

## Security Features

- JWT-based authentication
- Password hashing with BCrypt
- Row Level Security (RLS) on all database tables
- Role-based access control
- CORS configuration for frontend domain

## Future Enhancements

Consider adding:
- File upload support for PDF submissions
- Advanced plagiarism detection with TF-IDF/cosine similarity
- Integration with OpenAI API for better feedback
- Real-time notifications
- Assignment templates
- Batch submission evaluation
- Analytics dashboard for instructors
- Student performance tracking

## License

MIT License - Feel free to use this project for educational purposes.
