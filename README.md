# Hospital Reminder System 2.0

A comprehensive hospital appointment management system with role-based access control for Super Admin, Doctors, Doctor's PAs, and Patients.

## Features

- **User Roles:**
  - Super Admin: Full system access and user management
  - Doctor: View confirmed appointments and patient details
  - Doctor's PA: Confirm/reject pending appointments
  - Patient: Book appointments and view status

- **Appointment Flow:**
  1. Patient books an appointment (status: pending)
  2. PA reviews and confirms the appointment
  3. Patient receives confirmation notification
  4. Confirmed appointments appear in Doctor's dashboard with patient details

## Tech Stack

### Frontend
- React 19.2.3
- React Router DOM
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```
hospital-reminder-2.0/
├── sipitali/          # Frontend (React)
└── backend/           # Backend (Node.js/Express)
```

See `FILE_STRUCTURE.md` for detailed file structure.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital-reminder
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd sipitali
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the sipitali directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### Creating Users

1. **Super Admin**: Register with role `super_admin` (or create directly in database)
2. **Doctor**: Register with role `doctor`
3. **PA**: Register with role `pa`
4. **Patient**: Register with role `patient` (default)

### Workflow

1. **Patient Registration/Login**
   - Patient signs up or logs in
   - Redirected to Patient Dashboard

2. **Booking Appointment**
   - Patient clicks "Book New Appointment"
   - Selects doctor, date, time, and reason
   - Appointment status: `pending`

3. **PA Confirmation**
   - PA logs in and sees pending appointments
   - Reviews appointment details
   - Confirms or cancels the appointment

4. **Patient Notification**
   - Patient sees confirmation message on dashboard
   - Appointment status changes to `confirmed`

5. **Doctor View**
   - Doctor logs in and sees all confirmed appointments
   - Can view patient details and schedule

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Appointments
- `POST /api/appointments` - Create appointment (Patient)
- `GET /api/appointments/my-appointments` - Get patient's appointments
- `GET /api/appointments/pending` - Get pending appointments (PA)
- `GET /api/appointments/doctor/schedule` - Get doctor's schedule
- `PUT /api/appointments/:id/confirm` - Confirm appointment (PA)
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Users
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users` - Get all users (Super Admin)
- `GET /api/users/:id` - Get user by ID

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control (RBAC)
- Protected routes on both frontend and backend
- Input validation

## Development

### Running Both Servers

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd sipitali
npm start
```

## Notes

- Make sure MongoDB is running before starting the backend
- Update JWT_SECRET in production
- Use environment variables for sensitive data
- The system uses local storage for token management

## License

ISC

