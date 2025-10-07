/**
 * Department Migration Script
 *
 * This script:
 * 1. Creates default departments in the database
 * 2. Maps existing users with old department codes to new department ObjectIds
 *
 * Run with: node scripts/migrateDepartments.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const Department = require('../src/models/Department');
const User = require('../src/models/User');

// Default departments to create
const DEFAULT_DEPARTMENTS = [
  {
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development and technical infrastructure',
  },
  {
    name: 'Product',
    code: 'PROD',
    description: 'Product management and strategy',
  },
  {
    name: 'Quality Assurance',
    code: 'QA',
    description: 'Quality assurance and testing',
  },
  {
    name: 'Support',
    code: 'SUP',
    description: 'Customer support and success',
  },
  {
    name: 'Human Resources',
    code: 'HR',
    description: 'Human resources and talent management',
  },
  {
    name: 'Finance',
    code: 'FIN',
    description: 'Finance and accounting',
  },
  {
    name: 'Administration',
    code: 'ADMIN',
    description: 'General administration',
  },
];

// Mapping from old department enum values to department codes
const OLD_TO_NEW_MAPPING = {
  'engineering': 'ENG',
  'product': 'PROD',
  'qa': 'QA',
  'support': 'SUP',
  'hr': 'HR',
  'finance': 'FIN',
  'admin': 'ADMIN',
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function migrateDepartments() {
  try {
    console.log('\n🚀 Starting department migration...\n');

    // Step 1: Create default departments
    console.log('📋 Step 1: Creating default departments...');
    const createdDepartments = {};

    for (const deptData of DEFAULT_DEPARTMENTS) {
      // Check if department already exists
      let department = await Department.findOne({ code: deptData.code });

      if (!department) {
        department = await Department.create(deptData);
        console.log(`   ✓ Created department: ${department.name} (${department.code})`);
      } else {
        console.log(`   ⊙ Department already exists: ${department.name} (${department.code})`);
      }

      createdDepartments[deptData.code] = department._id;
    }

    console.log(`\n✅ Created/verified ${Object.keys(createdDepartments).length} departments\n`);

    // Step 2: Migrate existing users
    console.log('👥 Step 2: Migrating existing users...');

    const users = await User.find({});
    console.log(`   Found ${users.length} total users`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // If user has a department field (could be string enum or ObjectId)
        if (user.department) {
          const deptValue = user.department.toString();

          // Check if it's already an ObjectId (already migrated)
          if (mongoose.Types.ObjectId.isValid(deptValue) && deptValue.length === 24) {
            const deptExists = await Department.findById(deptValue);
            if (deptExists) {
              skippedCount++;
              continue;
            }
          }

          // Map old enum value to new department ID
          const deptCode = OLD_TO_NEW_MAPPING[deptValue.toLowerCase()];

          if (deptCode && createdDepartments[deptCode]) {
            user.department = createdDepartments[deptCode];
            await user.save();
            console.log(`   ✓ Migrated user: ${user.email} → ${deptCode}`);
            migratedCount++;
          } else {
            console.log(`   ⚠ Unknown department value for user ${user.email}: ${deptValue}`);
            // Clear invalid department value
            user.department = undefined;
            await user.save();
            errorCount++;
          }
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error migrating user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration Summary:`);
    console.log(`   • Migrated: ${migratedCount} users`);
    console.log(`   • Skipped: ${skippedCount} users (no department or already migrated)`);
    console.log(`   • Errors: ${errorCount} users\n`);

    console.log('🎉 Department migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await migrateDepartments();

    console.log('✨ All done! Closing database connection...');
    await mongoose.connection.close();
    console.log('👋 Goodbye!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  main();
}

module.exports = { migrateDepartments };
