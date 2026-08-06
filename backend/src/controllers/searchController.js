import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import QueryBuilder from "../utils/QueryBuilder.js";

const searchHospitals = async (req, res) => {
  try {
    const builder = new QueryBuilder(Hospital.find({ isDeleted: false }), req.query)
      .search(["name", "city", "location"])
      .filter()
      .paginate();

    const cacheKey = `search:hospitals:${req.originalUrl}`;
    const result = await builder.execute(cacheKey, 120);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Search Hospitals Error:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};

const searchPatients = async (req, res) => {
  try {
    const builder = new QueryBuilder(Patient.find({ isDeleted: false }), req.query)
      .search(["name", "bloodGroup"])
      .filter()
      .paginate();

    const cacheKey = `search:patients:${req.originalUrl}`;
    const result = await builder.execute(cacheKey, 120);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Search Patients Error:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};

const searchEmergencies = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(403).json({ success: false, message: "Only hospitals can perform this search" });
    }

    // Security filter: Hospitals can ONLY search their OWN accepted patients.
    const securityFilter = {
      acceptedBy: hospital._id
    };

    const builder = new QueryBuilder(EmergencyRequest.find(securityFilter), req.query)
      .search(["patientName", "city", "resourceType", "bedType"])
      .filter()
      .paginate();

    const cacheKey = `search:emergencies:${req.originalUrl}`;
    const result = await builder.execute(cacheKey, 120);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Search Emergencies Error:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};

export { searchHospitals, searchPatients, searchEmergencies };
