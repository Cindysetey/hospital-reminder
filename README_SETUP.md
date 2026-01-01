# Quick Setup Guide - Hospital Reminder System

## Initial Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Create Super Admin

**IMPORTANT:** Run this command to create the super admin user:

```bash
npm run seed:admin
```

This creates the super admin with:
- **Email:** cindycheptoo10@gmail.com
- **Password:** Aa@74141661
- **Role:** super_admin

### 3. Start Backend Server

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Frontend Setup

Open a new terminal:

```bash
cd sipitali
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## Login as Super Admin

1. Go to `http://localhost:3000/login`
2. Enter:
   - Email: `cindycheptoo10@gmail.com`
   - Password: `Aa@74141661`

## Super Admin Features

Once logged in as super admin, you can:

1. **User Management Tab:**
   - Create new doctors
   - Create new PAs (Physician Assistants)
   - Create new patients
   - View all users
   - Delete users

2. **All Appointments Tab:**
   - View all appointments in the system
   - Confirm appointments (like a PA would)
   - Cancel appointments
   - See all appointment details

3. **Quick Access Cards:**
   - Navigate to Patient Dashboard view
   - Navigate to PA Dashboard view
   - Navigate to Doctor Dashboard view
   - Access all features from admin dashboard

## Creating Users (Doctors & PAs)

1. Log in as super admin
2. Go to "User Management" tab
3. Click "Create New User"
4. Fill in the form:
   - Name
   - Email
   - Password (minimum 6 characters)
   - Role: Select "Doctor" or "PA (Physician Assistant)"
   - Phone (optional)
   - Address (optional)
5. Click "Create User"

The new user will be created and can log in with their credentials.

## Notes

- The super admin has full access to all endpoints and can perform any action
- Super admin can view and manage all appointments
- Super admin can create users with any role (doctor, pa, patient)
- All user passwords are securely hashed using bcrypt

