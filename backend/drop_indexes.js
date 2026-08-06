import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    
    try {
      const db = mongoose.connection.db;
      
      // Try to drop the problematic index on hospitals collection
      console.log("Attempting to drop email_1 index from hospitals collection...");
      await db.collection("hospitals").dropIndex("email_1");
      console.log("Dropped email_1 from hospitals successfully.");
    } catch (err) {
      console.error("Error dropping from hospitals:", err.message);
    }
    
    try {
      const db = mongoose.connection.db;
      
      // Try to drop the problematic index on patients collection
      console.log("Attempting to drop email_1 index from patients collection...");
      await db.collection("patients").dropIndex("email_1");
      console.log("Dropped email_1 from patients successfully.");
    } catch (err) {
      console.error("Error dropping from patients:", err.message);
    }
    
    mongoose.disconnect();
    console.log("Done.");
  })
  .catch(err => {
    console.error("Connection error:", err);
  });
