import Hospital from "../models/Hospital.js";
import { BED_TYPES } from "../constants/resourceConstants.js";
import { BLOOD_GROUPS } from "../constants/resourceConstants.js";

const getResources = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.userId });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      resources: {
        beds: hospital.beds,
        bloodInventory: hospital.bloodInventory,
        oxygenInventory: hospital.oxygenInventory,
        resourceUpdatedAt: hospital.resourceUpdatedAt,
      },
    });
  } catch (error) {
    console.error("Get Resources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
    });
  }
};

const updateResources = async (req, res) => {
  try {
    const { beds, bloodInventory, oxygenInventory } = req.body;

    const hasBeds = beds && Object.keys(beds).length > 0;
    const hasBloodInventory = bloodInventory && Object.keys(bloodInventory).length > 0;
    const hasOxygenInventory = oxygenInventory && Object.keys(oxygenInventory).length > 0;

    if (!hasBeds && !hasBloodInventory && !hasOxygenInventory) {
      return res.status(400).json({
        success: false,
        message: "No resources provided to update",
      });
    }

    if (hasBeds) {
      const invalidBedTypes = Object.keys(beds).filter(
        (bedType) => !BED_TYPES.includes(bedType),
      );

      if (invalidBedTypes.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid bed type(s): ${invalidBedTypes.join(", ")}`,
        });
      }
    }

    if (hasBloodInventory) {
      const invalidBloodGroups = Object.keys(bloodInventory).filter(
        (group) => !BLOOD_GROUPS.includes(group),
      );

      if (invalidBloodGroups.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid blood group(s): ${invalidBloodGroups.join(", ")}`,
        });
      }
    }

    const hospital = await Hospital.findOne({ userId: req.user.userId });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const updateQuery = {};

    // ===========================
    // Update Beds
    // ===========================

    if (hasBeds) {
      for (const bedType of BED_TYPES) {
        const incomingBed = beds?.[bedType];

        if (!incomingBed) continue;

        if (incomingBed.total !== undefined) {
          updateQuery[`beds.${bedType}.total`] = incomingBed.total;
          hospital.beds[bedType].total = incomingBed.total;
        }

        if (incomingBed.available !== undefined) {
          updateQuery[`beds.${bedType}.available`] = incomingBed.available;
          hospital.beds[bedType].available = incomingBed.available;
        }

        const currentBed = hospital.beds[bedType];

        if (currentBed.total < 0 || currentBed.available < 0) {
          return res.status(400).json({
            success: false,
            message: `${bedType} bed values cannot be negative`,
          });
        }

        if (currentBed.available > currentBed.total) {
          return res.status(400).json({
            success: false,
            message: `${bedType} available beds cannot exceed total beds`,
          });
        }
      }
    }

    // ===========================
    // Update Blood Inventory
    // ===========================

    if (hasBloodInventory) {
      for (const bloodGroup of BLOOD_GROUPS) {
        const incomingUnits = bloodInventory?.[bloodGroup];

        if (incomingUnits === undefined) continue;

        updateQuery[`bloodInventory.${bloodGroup}`] = incomingUnits;
        hospital.bloodInventory[bloodGroup] = incomingUnits;

        if (hospital.bloodInventory[bloodGroup] < 0) {
          return res.status(400).json({
            success: false,
            message: `${bloodGroup} blood units cannot be negative`,
          });
        }
      }
    }

    // ===========================
    // Update Oxygen Inventory
    // ===========================

    if (hasOxygenInventory) {
      if (oxygenInventory.total !== undefined) {
        updateQuery["oxygenInventory.total"] = oxygenInventory.total;
        hospital.oxygenInventory.total = oxygenInventory.total;
      }
      if (oxygenInventory.available !== undefined) {
        updateQuery["oxygenInventory.available"] = oxygenInventory.available;
        hospital.oxygenInventory.available = oxygenInventory.available;
      }

      if (hospital.oxygenInventory.total < 0 || hospital.oxygenInventory.available < 0) {
        return res.status(400).json({ success: false, message: "Oxygen units cannot be negative" });
      }
      if (hospital.oxygenInventory.available > hospital.oxygenInventory.total) {
        return res.status(400).json({ success: false, message: "Available oxygen cannot exceed total" });
      }
    }

    if (Object.keys(updateQuery).length > 0) {
      updateQuery.resourceUpdatedAt = new Date();

      const updatedHospital = await Hospital.findOneAndUpdate(
        { userId: req.user.userId },
        { $set: updateQuery },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Resources updated successfully",
        resources: {
          beds: updatedHospital.beds,
          bloodInventory: updatedHospital.bloodInventory,
          oxygenInventory: updatedHospital.oxygenInventory,
          resourceUpdatedAt: updatedHospital.resourceUpdatedAt,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "No resources were modified",
      resources: {
        beds: hospital.beds,
        bloodInventory: hospital.bloodInventory,
        oxygenInventory: hospital.oxygenInventory,
        resourceUpdatedAt: hospital.resourceUpdatedAt,
      },
    });
  } catch (error) {
    console.error("Update Resources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update resources",
    });
  }
};

export { getResources, updateResources };
