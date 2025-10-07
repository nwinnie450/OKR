const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Ping to confirm connection
    await conn.connection.db.admin().command({ ping: 1 });
    console.log('✅ Pinged deployment. Successfully connected to MongoDB!');

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
