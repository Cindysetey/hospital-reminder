# Hospital Reminder System - File Structure

## Project Overview
A React + Node.js application for managing hospital appointments with role-based access control.

## Directory Structure

```
hospital-reminder-2.0/
│
├── sipitali/                    # Frontend (React)
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── ...
│   │
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/
│   │   │   │   ├── Header.js
│   │   │   │   ├── Footer.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   ├── Loading.js
│   │   │   │   ├── Modal.js
│   │   │   │   └── Button.js
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.js
│   │   │   │   ├── SignupForm.js
│   │   │   │   └── ProtectedRoute.js
│   │   │   │
│   │   │   └── appointments/
│   │   │       ├── AppointmentCard.js
│   │   │       ├── AppointmentForm.js
│   │   │       ├── AppointmentList.js
│   │   │       └── ScheduleCalendar.js
│   │   │
│   │   ├── pages/               # Page components
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   │
│   │   │   ├── patient/
│   │   │   │   ├── PatientDashboard.js
│   │   │   │   ├── BookAppointment.js
│   │   │   │   └── MyAppointments.js
│   │   │   │
│   │   │   ├── pa/
│   │   │   │   ├── PADashboard.js
│   │   │   │   ├── PendingAppointments.js
│   │   │   │   └── ConfirmedAppointments.js
│   │   │   │
│   │   │   ├── doctor/
│   │   │   │   ├── DoctorDashboard.js
│   │   │   │   ├── DoctorSchedule.js
│   │   │   │   └── PatientDetails.js
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.js
│   │   │       ├── UserManagement.js
│   │   │       └── SystemSettings.js
│   │   │
│   │   ├── context/             # React Context for state management
│   │   │   ├── AuthContext.js
│   │   │   └── AppContext.js
│   │   │
│   │   ├── services/            # API service functions
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── appointmentService.js
│   │   │   └── userService.js
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── helpers.js
│   │   │   ├── constants.js
│   │   │   └── validators.js
│   │   │
│   │   ├── styles/              # CSS files
│   │   │   ├── App.css
│   │   │   ├── index.css
│   │   │   ├── components/
│   │   │   │   ├── Header.css
│   │   │   │   ├── Sidebar.css
│   │   │   │   └── ...
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.css
│   │   │   │   ├── Login.css
│   │   │   │   └── ...
│   │   │   └── common/
│   │   │       ├── variables.css
│   │   │       └── utilities.css
│   │   │
│   │   ├── App.js               # Main App component with routing
│   │   ├── index.js             # Entry point
│   │   └── reportWebVitals.js
│   │
│   ├── package.json
│   └── README.md
│
├── backend/                     # Backend (Node.js/Express)
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   ├── jwt.js               # JWT configuration
│   │   └── env.js               # Environment variables
│   │
│   ├── models/                  # Database models
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   └── Doctor.js
│   │
│   ├── routes/                  # API routes
│   │   ├── auth/
│   │   │   ├── authRoutes.js
│   │   │   └── authController.js
│   │   │
│   │   ├── appointments/
│   │   │   ├── appointmentRoutes.js
│   │   │   └── appointmentController.js
│   │   │
│   │   ├── users/
│   │   │   ├── userRoutes.js
│   │   │   └── userController.js
│   │   │
│   │   └── index.js             # Route aggregator
│   │
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── roleCheck.js         # Role-based access control
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── validation.js        # Request validation
│   │
│   ├── controllers/             # Business logic (if separate from routes)
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── validators.js
│   │
│   ├── server.js                # Main server file
│   ├── package.json
│   └── .env                      # Environment variables (not in git)
│
└── README.md                    # Project documentation
```

## User Roles & Permissions

### Super Admin
- Full system access
- User management
- System settings
- View all appointments

### Doctor
- View confirmed appointments
- View patient details
- View schedule
- Cannot confirm appointments (PA does this)

### Doctor's PA (Physician Assistant)
- View pending appointments
- Confirm/reject appointments
- View patient details
- Once confirmed, appointments appear in Doctor's dashboard

### Patient
- Sign up / Login
- Book appointments
- View appointment status (pending/confirmed)
- View confirmation messages

## Data Flow

1. **Patient Books Appointment**
   - Patient → Frontend → Backend API → Database
   - Status: "pending"

2. **PA Confirms Appointment**
   - PA → Frontend → Backend API → Database
   - Status: "confirmed"
   - Notification sent to Patient

3. **Doctor Views Appointments**
   - Doctor → Frontend → Backend API → Database
   - Shows all confirmed appointments with patient details

## Technology Stack

### Frontend
- React 19.2.3
- React Router (for navigation)
- CSS (for styling)
- Axios (for API calls)

### Backend
- Node.js
- Express.js
- MongoDB/Mongoose (or your preferred database)
- JWT (for authentication)
- bcrypt (for password hashing)

