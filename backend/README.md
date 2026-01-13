# Backend API - Hospital Reminder System

Express.js backend server for the Hospital Reminder System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://cheptoots:Setey%4090@cluster0.yikdxew.mongodb.net/hospital-reminder?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Seed the super admin user:
```bash
npm run seed:admin
```

This will create the super admin with credentials:
- Email: cindycheptoo10@gmail.com
- Password: Aa@74141661

4. Start server:
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

## API Documentation

See main README.md for API endpoints.

## Super Admin

The super admin has full access to:
- All user management (create doctors, PAs, patients)
- View all appointments
- Confirm/cancel appointments
- Access all endpoints
