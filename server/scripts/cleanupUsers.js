const mongoose = require('mongoose');
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

async function cleanupUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Get all users
    const allUsers = await User.find({});
    console.log(`\n📊 Found ${allUsers.length} users in database:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    // Delete all users except admin@merquri.io
    const result = await User.deleteMany({
      email: { $ne: 'admin@merquri.io' }
    });

    console.log(`\n🗑️  Deleted ${result.deletedCount} demo users`);

    // Show remaining users
    const remainingUsers = await User.find({});
    console.log(`\n✅ Remaining users (${remainingUsers.length}):`);
    remainingUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupUsers();
