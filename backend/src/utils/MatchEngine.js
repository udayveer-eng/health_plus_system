export default class MatchEngine {
  static PRIORITY_SCORES = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
    CRITICAL: 100,
    HIGH: 75,
    MEDIUM: 50,
    LOW: 25
  };

  static COMPATIBILITY = {
    'O_NEGATIVE': ['O_NEGATIVE'],
    'O_POSITIVE': ['O_POSITIVE', 'O_NEGATIVE'],
    'A_NEGATIVE': ['A_NEGATIVE', 'O_NEGATIVE'],
    'A_POSITIVE': ['A_POSITIVE', 'A_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
    'B_NEGATIVE': ['B_NEGATIVE', 'O_NEGATIVE'],
    'B_POSITIVE': ['B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
    'AB_NEGATIVE': ['AB_NEGATIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'O_NEGATIVE'],
    'AB_POSITIVE': ['AB_POSITIVE', 'AB_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
  };

  /**
   * Ranks requests based on urgency, time decay, and resource scarcity.
   * Filters out requests the hospital cannot fulfill.
   */
  static rankRequestsForHospital(hospital, requests) {
    const scoredRequests = requests.map(req => {
      let score = this.PRIORITY_SCORES[req.priority] || 50;

      // Time decay: +0.5 points per minute waiting
      const minutesWaiting = (Date.now() - new Date(req.createdAt).getTime()) / 60000;
      score += (minutesWaiting * 0.5);

      if (req.resourceType === 'blood') {
        const patientType = req.bloodGroup;
        const compatibleTypes = this.COMPATIBILITY[patientType] || [patientType];
        
        let canFulfill = false;
        
        // Exact match preferred
        if ((hospital.bloodInventory[patientType] || 0) >= req.quantity) {
          canFulfill = true;
          score += 20; // Exact match bonus
        } else {
          for (const type of compatibleTypes) {
            if ((hospital.bloodInventory[type] || 0) >= req.quantity) {
              canFulfill = true;
              break;
            }
          }
        }

        if (!canFulfill) return null;

        // Scarcity Triage: Penalize universal recipients so they don't easily consume universal donors
        // The fewer types you can receive, the higher your score.
        const scarcityBonus = (8 - compatibleTypes.length) * 5;
        score += scarcityBonus;
      } else if (req.resourceType === 'bed') {
        if ((hospital.beds[req.bedType]?.available || 0) < req.quantity) return null;
      } else if (req.resourceType === 'oxygen') {
        if ((hospital.oxygenInventory?.available || 0) < req.quantity) return null;
      }

      const reqObj = req.toObject ? req.toObject() : { ...req };
      return { ...reqObj, matchScore: Math.round(score) };
    });

    // Filter out nulls and sort descending by matchScore
    return scoredRequests
      .filter(req => req !== null)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Determines the specific blood group to deduct from inventory, prioritizing exact matches.
   */
  static getBestCompatibleBloodGroup(hospital, requestedGroup, quantity) {
    const compatibleTypes = this.COMPATIBILITY[requestedGroup] || [requestedGroup];
    
    // First try exact match
    if ((hospital.bloodInventory[requestedGroup] || 0) >= quantity) {
      return requestedGroup;
    }
    
    // Fallback to compatible
    for (const type of compatibleTypes) {
      if ((hospital.bloodInventory[type] || 0) >= quantity) {
        return type;
      }
    }
    return null;
  }
}
