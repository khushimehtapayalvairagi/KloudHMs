
const mongoose = require("mongoose");

async function connectDB(url) {
  try {
    await mongoose.connect(url);
    console.log("✅ Database connected successfully");

    // 🔍 Debug info: show connected DB name and collections
    mongoose.connection.on("connected", async () => {
      console.log("✅ MongoDB Connected:", mongoose.connection.name);
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log("📚 Collections in this DB:", collections.map(c => c.name));
    });

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
module.exports = { connectDB };

