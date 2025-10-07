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

async function verifyAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@merquri.io' });

    if (!admin) {
      console.log('❌ Admin user not found!');
    } else {
      console.log('✅ Admin user found:');
      console.log('   ID:', admin._id);
      console.log('   Name:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Teams:', admin.teams);
      console.log('   Password hash:', admin.password.substring(0, 20) + '...');

      // Test password
      const testPassword = 'Password888!';
      const passwordMatch = await bcrypt.compare(testPassword, admin.password);
      console.log('\n🔐 Password Test:');
      console.log('   Testing password:', testPassword);
      console.log('   Match:', passwordMatch ? '✅ YES' : '❌ NO');

      if (!passwordMatch) {
        console.log('\n⚠️  Password does not match! Resetting password...');
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        admin.password = hashedPassword;
        await admin.save();
        console.log('✅ Password reset successful!');
      }
    }

    // List all users
    const allUsers = await User.find({});
    console.log(`\n📊 All users in database (${allUsers.length}):`);
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyAdmin();
