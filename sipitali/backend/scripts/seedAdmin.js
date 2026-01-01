const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'cindycheptoo10@gmail.com';
    const adminPassword = 'Aa@74141661';

    // Check if super admin already exists (include password field for update)
    const existingAdmin = await User.findOne({ email: adminEmail }).select('+password');

    if (existingAdmin) {
      console.log('Super admin already exists. Updating password and role...');
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'super_admin';
      await existingAdmin.save();
      console.log('Super admin updated successfully!');
    } else {
      // Create super admin
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
      });
      console.log('Super admin created successfully!');
      console.log('Email:', superAdmin.email);
      console.log('Role:', superAdmin.role);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();

