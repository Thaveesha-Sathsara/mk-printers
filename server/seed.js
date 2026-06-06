require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/admin.model');

const seedAdmin = async () => {
  try {
    // Connect to your database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Check if an admin already exists to prevent duplicates
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit();
    }

    // Hash the default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create the admin record
    const newAdmin = new Admin({
      username: 'admin',
      password: hashedPassword,
      email: 't.s.vithana@gmail.com'
    });

    await newAdmin.save();
    console.log('Admin account created successfully!');
    console.log('Username: admin');
    console.log('Password: password123');
    
    process.exit(); // Close the script
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();