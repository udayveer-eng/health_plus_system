/**
 * TransitEngine
 * Implements Dijkstra's Algorithm for emergency routing and ETA calculation
 * over a synthetic graph of Noida sectors/zones.
 */

// Synthetic Graph representing Noida Zones and base distances (in km) between them
const NOIDA_GRAPH = {
  "Sector 18": { "Sector 62": 8.5, "Sector 128": 12.0, "Sector 50": 6.0, "Greater Noida Expressway": 15.0 },
  "Sector 62": { "Sector 18": 8.5, "Sector 50": 4.5, "Sector 128": 14.5, "Greater Noida Expressway": 18.0 },
  "Sector 50": { "Sector 18": 6.0, "Sector 62": 4.5, "Sector 137": 9.0 },
  "Sector 128": { "Sector 18": 12.0, "Sector 62": 14.5, "Sector 137": 3.5, "Greater Noida Expressway": 5.0 },
  "Sector 137": { "Sector 50": 9.0, "Sector 128": 3.5, "Pari Chowk": 12.0, "Greater Noida Expressway": 2.0 },
  "Greater Noida Expressway": { "Sector 18": 15.0, "Sector 62": 18.0, "Sector 128": 5.0, "Sector 137": 2.0, "Pari Chowk": 14.0 },
  "Pari Chowk": { "Sector 137": 12.0, "Greater Noida Expressway": 14.0 }
};

// Simulated dynamic traffic multiplier (1.0 = clear, >1.0 = congested)
// In a real system, this would be updated by Mapbox or Google Maps Matrix API
const TRAFFIC_MULTIPLIERS = {
  "Sector 18": { "Sector 62": 1.2, "Sector 128": 1.0, "Sector 50": 1.5, "Greater Noida Expressway": 1.5 },
  "Sector 62": { "Sector 18": 1.5, "Sector 50": 1.2, "Sector 128": 1.2, "Greater Noida Expressway": 1.1 },
  "Sector 50": { "Sector 18": 1.2, "Sector 62": 1.1, "Sector 137": 1.0 },
  "Sector 128": { "Sector 18": 1.0, "Sector 62": 1.2, "Sector 137": 1.0, "Greater Noida Expressway": 1.0 },
  "Sector 137": { "Sector 50": 1.1, "Sector 128": 1.0, "Pari Chowk": 1.0, "Greater Noida Expressway": 1.2 },
  "Greater Noida Expressway": { "Sector 18": 1.8, "Sector 62": 1.1, "Sector 128": 1.0, "Sector 137": 1.5, "Pari Chowk": 1.0 },
  "Pari Chowk": { "Sector 137": 1.0, "Greater Noida Expressway": 1.1 }
};

class PriorityQueue {
  constructor() {
    this.values = [];
  }
  
  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }
  
  dequeue() {
    return this.values.shift();
  }
  
  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }
  
  isEmpty() {
    return this.values.length === 0;
  }
}

class TransitEngine {
  /**
   * Compute shortest path using Dijkstra's algorithm with dynamic traffic weights
   * @param {string} startZone 
   * @param {string} endZone 
   * @param {number} speedKmh - Average speed of the ambulance
   * @returns {Object} { path: string[], distanceKm: number, etaMinutes: number }
   */
  static getShortestPath(startZone, endZone, speedKmh = 60) {
    if (!NOIDA_GRAPH[startZone] || !NOIDA_GRAPH[endZone]) {
      // Fallback if zones don't exist in synthetic graph
      return { path: [startZone, endZone], distanceKm: 10, etaMinutes: 15 };
    }

    if (startZone === endZone) {
      return { path: [startZone], distanceKm: 0, etaMinutes: 0 };
    }

    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();
    let path = [];
    
    // Initialize
    for (let vertex in NOIDA_GRAPH) {
      if (vertex === startZone) {
        distances[vertex] = 0;
        pq.enqueue(vertex, 0);
      } else {
        distances[vertex] = Infinity;
        pq.enqueue(vertex, Infinity);
      }
      previous[vertex] = null;
    }
    
    let smallest;
    while (!pq.isEmpty()) {
      smallest = pq.dequeue().val;
      
      if (smallest === endZone) {
        // Build path to return
        while (previous[smallest]) {
          path.push(smallest);
          smallest = previous[smallest];
        }
        break;
      }
      
      if (smallest || distances[smallest] !== Infinity) {
        for (let neighbor in NOIDA_GRAPH[smallest]) {
          // Dynamic edge weight: base distance * traffic multiplier
          const baseDist = NOIDA_GRAPH[smallest][neighbor];
          const traffic = TRAFFIC_MULTIPLIERS[smallest][neighbor] || 1.0;
          const weightedDistance = baseDist * traffic;
          
          const candidate = distances[smallest] + weightedDistance;
          if (candidate < distances[neighbor]) {
            distances[neighbor] = candidate;
            previous[neighbor] = smallest;
            pq.enqueue(neighbor, candidate);
          }
        }
      }
    }
    
    path.push(startZone);
    path.reverse();
    
    const totalWeightedDistance = distances[endZone];
    
    // Calculate raw distance (without traffic) for the path to return
    let distanceKm = 0;
    for (let i = 0; i < path.length - 1; i++) {
      distanceKm += NOIDA_GRAPH[path[i]][path[i + 1]];
    }
    
    // Calculate ETA in minutes based on weighted distance and speed
    const etaHours = totalWeightedDistance / speedKmh;
    const etaMinutes = Math.round(etaHours * 60);
    
    return {
      path,
      distanceKm,
      etaMinutes
    };
  }
}

export default TransitEngine;
