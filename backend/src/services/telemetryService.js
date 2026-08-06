import Hospital from "../models/Hospital.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import Doctor from "../models/Doctor.js";
import Ambulance from "../models/Ambulance.js";
import SocketService from "./socketService.js";
import { SOCKET_EVENTS } from "../socket/socketEvents.js";

class TelemetryService {
  constructor() {
    this.intervalId = null;
    // Keep track of simulated state to allow realistic pseudo-random walks
    this.simulatedState = {};
  }

  start() {
    if (this.intervalId) return;
    console.log("TelemetryService: Starting Command Center broadcast tick (2000ms)");
    
    this.intervalId = setInterval(async () => {
      try {
        await this.broadcastTelemetry();
      } catch (error) {
        console.error("TelemetryService Error:", error);
      }
    }, 2000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async broadcastTelemetry() {
    const hospitals = await Hospital.find({ isDeleted: false });

    // Group hospitals by city for regional telemetry
    const regions = {};
    for (const h of hospitals) {
      const city = (h.city || "unknown").toLowerCase();
      if (!regions[city]) regions[city] = [];
      regions[city].push(h);
    }

    for (const [city, cityHospitals] of Object.entries(regions)) {
      const hospitalIds = cityHospitals.map(h => h._id);

      const [activeEmergencies, waitingPatients, doctorsOnline, ambulancesEnRoute] = await Promise.all([
        EmergencyRequest.countDocuments({ acceptedBy: { $in: hospitalIds }, status: { $in: ["ACCEPTED", "IN_PROGRESS"] } }),
        EmergencyRequest.countDocuments({ city: new RegExp(`^${city}$`, "i"), status: { $in: ["PENDING", "pending"] } }),
        Doctor.countDocuments({ hospitalId: { $in: hospitalIds }, status: "ONLINE", isDeleted: false }),
        Ambulance.countDocuments({ hospitalId: { $in: hospitalIds }, status: "EN_ROUTE", isDeleted: false })
      ]);

      let totalBeds = 0;
      let totalIcu = 0;
      let totalBlood = 0;
      let oxygen = 0;

      for (const hospital of cityHospitals) {
        if (hospital.beds) {
          totalBeds += (hospital.beds.general?.available || 0) + 
                       (hospital.beds.icu?.available || 0) + 
                       (hospital.beds.ventilator?.available || 0) + 
                       (hospital.beds.emergency?.available || 0);
          totalIcu += hospital.beds.icu?.available || 0;
        }

        if (hospital.bloodInventory) {
          const bloodData = hospital.bloodInventory.toJSON ? hospital.bloodInventory.toJSON() : hospital.bloodInventory;
          Object.values(bloodData).forEach(val => {
            if (typeof val === 'number') totalBlood += val;
          });
        }
        oxygen += hospital.oxygenInventory?.available || 0;
      }

      const payload = {
        timestamp: new Date().toISOString(),
        beds: totalBeds,
        icu: totalIcu,
        blood: totalBlood,
        oxygen: oxygen,
        activeEmergencies,
        waitingPatients,
        ambulances: ambulancesEnRoute,
        doctorsOnline: doctorsOnline,
      };

      // O(1) Broadcast to all clients in the region
      SocketService.emitToRegion(city, SOCKET_EVENTS.COMMAND_CENTER_TELEMETRY, payload);
    }
  }
}

export default new TelemetryService();
