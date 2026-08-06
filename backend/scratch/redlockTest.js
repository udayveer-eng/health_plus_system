import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../src/utils/db.js';
import EmergencyRequest from '../src/models/EmergencyRequest.js';
import Hospital from '../src/models/Hospital.js';
import redlock from '../src/config/redlock.js';
import { acceptEmergencyRequest } from '../src/controllers/emergencyRequestController.js';

async function simulateConcurrency() {
  await connectDB();
  
  // Find a hospital and create a mock emergency request
  const hospital = await Hospital.findOne({ userId: { $exists: true } });
  if (!hospital) {
    console.log("No hospital found to run test.");
    process.exit(1);
  }

  // Ensure hospital has at least 1 emergency bed
  hospital.beds = hospital.beds || {};
  hospital.beds.emergency = { total: 10, available: 1 }; // Only 1 available
  await hospital.save();

  console.log(`Hospital Inventory Reset: ${hospital.beds.emergency.available} emergency bed available.`);

  // Create a mock pending emergency request
  const emergencyReq = await EmergencyRequest.create({
    patientId: new mongoose.Types.ObjectId(),
    patientName: "Concurrent Test Patient",
    phone: "9999999999",
    city: hospital.city,
    resourceType: "bed",
    bedType: "emergency",
    quantity: 1,
    priority: "critical",
    status: "PENDING",
  });

  console.log(`Mock Emergency Request Created: ${emergencyReq._id}`);

  // We will simulate 5 concurrent Express requests hitting acceptEmergencyRequest
  // by creating mock req and res objects
  
  const results = [];
  
  const mockRequests = Array.from({ length: 5 }).map((_, idx) => {
    return async () => {
      // Mock Express Req/Res
      const req = {
        params: { id: emergencyReq._id },
        user: { userId: hospital.userId, role: "HOSPITAL" }
      };
      
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          results.push(`Worker ${idx + 1}: Status ${this.statusCode} - ${data.message || data.success}`);
          return this;
        }
      };

      try {
        await acceptEmergencyRequest(req, res);
      } catch (e) {
        results.push(`Worker ${idx + 1}: Error - ${e.message}`);
      }
    };
  });

  console.log("Launching 5 concurrent requests...");
  await Promise.all(mockRequests.map(fn => fn()));
  
  console.log("\nResults:");
  results.forEach(r => console.log(r));

  // Verify final state
  const finalReq = await EmergencyRequest.findById(emergencyReq._id);
  const finalHosp = await Hospital.findById(hospital._id);
  
  console.log(`\nFinal Request Status: ${finalReq.status}`);
  console.log(`Final Hospital Beds Available: ${finalHosp.beds.emergency.available}`);

  // Cleanup
  await EmergencyRequest.findByIdAndDelete(emergencyReq._id);
  
  process.exit(0);
}

simulateConcurrency();
