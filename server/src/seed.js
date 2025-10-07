const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load env vars from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create test users
    const users = [
      {
        email: 'admin@okr.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        avatar: '👨‍💼',
      },
      {
        email: 'manager@okr.com',
        password: 'manager123',
        name: 'Manager User',
        role: 'manager',
        avatar: '👔',
      },
      {
        email: 'member@okr.com',
        password: 'member123',
        name: 'Member User',
        role: 'member',
        avatar: '👤',
      },
      {
        email: 'viewer@okr.com',
        password: 'viewer123',
        name: 'Viewer User',
        role: 'viewer',
        avatar: '👁️',
      },
    ];

    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@okr.com   / admin123');
    console.log('Manager: manager@okr.com / manager123');
    console.log('Member:  member@okr.com  / member123');
    console.log('Viewer:  viewer@okr.com  / viewer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
