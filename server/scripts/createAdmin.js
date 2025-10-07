const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
  avatar: String,
  avatarUrl: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@okr.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');

      // Update the existing user to be admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.name = 'Admin User';
      await existingAdmin.save();

      console.log('✅ Updated existing user to admin:');
      console.log('   Email: admin@okr.com');
      console.log('   Password: admin123');
      console.log('   Role:', existingAdmin.role);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = new User({
        name: 'Admin User',
        email: 'admin@okr.com',
        password: hashedPassword,
        role: 'admin',
        teams: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await admin.save();
      console.log('✅ Admin user created successfully:');
      console.log('   Email: admin@okr.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
