const mongoose = require('mongoose');
require('dotenv').config();

const clearAllData = async () => {
  try {
    console.log('🗑️  Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const collections = await mongoose.connection.db.collections();

    console.log('📊 Current collections:');
    for (const collection of collections) {
      const count = await collection.countDocuments();
      console.log(`   - ${collection.collectionName}: ${count} documents`);
    }

    console.log('\n🗑️  Clearing all data...\n');

    for (const collection of collections) {
      const name = collection.collectionName;
      const result = await collection.deleteMany({});
      console.log(`   ✅ Cleared ${name}: ${result.deletedCount} documents deleted`);
    }

    console.log('\n🎉 All data has been cleared successfully!');
    console.log('💡 The database is now empty. You can start fresh.\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearAllData();
