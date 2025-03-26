import { RaceResult } from './race-data';

interface BetPrediction {
  position: number;
  driver_name: string;
}

export interface ScoringResult {
  totalScore: number;
  breakdown: {
    exactPositions: { driver: string; position: number; points: number }[];
    onePositionOff: { driver: string; position: number; points: number }[];
    twoPositionsOff: { driver: string; position: number; points: number }[];
    threePositionsOff: { driver: string; position: number; points: number }[];
    inTopTenWrongSpot: { driver: string; position: number; points: number }[];
    notInTopTen: { driver: string; position: number; points: number }[];
    bonuses: {
      perfectPodium?: number;
      perfectTopFive?: number;
      perfectTopTen?: number;
      correctWinner?: number;
      fastestLap?: number;
      correctDNFs?: { driver: string; points: number }[];
    };
  };
}

export function calculateScore(
  prediction: string,
  fastestLap: string | null,
  dnfPrediction: string | null,
  raceResults: RaceResult[]
): ScoringResult {
  // Parse the prediction JSON string
  const parsedPrediction: string[] = JSON.parse(prediction);
  
  // Convert prediction to a more usable format
  const betPredictions: BetPrediction[] = parsedPrediction
    .map((driver, index) => ({ position: index + 1, driver_name: driver }))
    .filter(p => p.driver_name); // Filter out empty predictions
  
  // Parse DNF predictions
  const dnfPredictions: string[] = dnfPrediction ? JSON.parse(dnfPrediction) : [];
  
  // Initialize scoring result
  const result: ScoringResult = {
    totalScore: 0,
    breakdown: {
      exactPositions: [],
      onePositionOff: [],
      twoPositionsOff: [],
      threePositionsOff: [],
      inTopTenWrongSpot: [],
      notInTopTen: [],
      bonuses: {
        correctDNFs: []
      }
    }
  };
  
  // Create a map of actual positions by driver name
  const actualPositionsByDriver = new Map<string, number>();
  const actualDNFs = new Set<string>();
  let actualFastestLap = '';
  
  raceResults.forEach(result => {
    if (!result.dnf) {
      actualPositionsByDriver.set(result.driver_name, result.position);
    } else {
      actualDNFs.add(result.driver_name);
    }
    
    if (result.fastest_lap) {
      actualFastestLap = result.driver_name;
    }
  });
  
  // Score each prediction
  betPredictions.forEach(prediction => {
    const actualPosition = actualPositionsByDriver.get(prediction.driver_name);
    
    // Driver did not finish (DNF)
    if (actualDNFs.has(prediction.driver_name)) {
      // No points for predicting a driver who DNF'd
      return;
    }
    
    // Driver not in top 10 at all
    if (actualPosition === undefined || actualPosition > 10) {
      result.breakdown.notInTopTen.push({
        driver: prediction.driver_name,
        position: prediction.position,
        points: -5
      });
      result.totalScore -= 5;
      return;
    }
    
    // Calculate position difference
    const positionDiff = Math.abs(prediction.position - actualPosition);
    
    if (positionDiff === 0) {
      // Correct position: +25 points
      result.breakdown.exactPositions.push({
        driver: prediction.driver_name,
        position: prediction.position,
        points: 25
      });
      result.totalScore += 25;
    } else if (positionDiff === 1) {
      // One position off: +15 points
      result.breakdown.onePositionOff.push({
        driver: prediction.driver_name,
        position: prediction.position,
        points: 15
      });
      result.totalScore += 15;
    } else if (positionDiff === 2) {
      // Two positions off: +10 points
      result.breakdown.twoPositionsOff.push({
        driver: prediction.driver_name,
        position: prediction.position,
        points: 10
      });
      result.totalScore += 10;
    } else if (positionDiff === 3) {
      // Three positions off: +5 points
      result.breakdown.threePositionsOff.push({
        driver: prediction.driver_name,
        position: prediction.position,
        points: 5
      });
      result.totalScore += 5;
    } else if (actualPosition <= 10) {
      // Driver in top 10 but wrong spot: +2 points
      result.breakdown.inTopTenWrongSpot.push({
        driver: prediction.driver_name,
        position: prediction.position,
        points: 2
      });
      result.totalScore += 2;
    }
  });
  
  // Check for bonus points
  
  // Perfect podium (top 3 in exact order): +30 points
  if (
    betPredictions.length >= 3 &&
    betPredictions[0].driver_name === raceResults.find(r => r.position === 1)?.driver_name &&
    betPredictions[1].driver_name === raceResults.find(r => r.position === 2)?.driver_name &&
    betPredictions[2].driver_name === raceResults.find(r => r.position === 3)?.driver_name
  ) {
    result.breakdown.bonuses.perfectPodium = 30;
    result.totalScore += 30;
  }
  
  // Perfect top 5 (exact order): +50 points
  if (
    betPredictions.length >= 5 &&
    betPredictions[0].driver_name === raceResults.find(r => r.position === 1)?.driver_name &&
    betPredictions[1].driver_name === raceResults.find(r => r.position === 2)?.driver_name &&
    betPredictions[2].driver_name === raceResults.find(r => r.position === 3)?.driver_name &&
    betPredictions[3].driver_name === raceResults.find(r => r.position === 4)?.driver_name &&
    betPredictions[4].driver_name === raceResults.find(r => r.position === 5)?.driver_name
  ) {
    result.breakdown.bonuses.perfectTopFive = 50;
    result.totalScore += 50;
  }
  
  // Perfect top 10 (exact order): +100 points
  if (
    betPredictions.length >= 10 &&
    betPredictions.slice(0, 10).every((pred, index) => 
      pred.driver_name === raceResults.find(r => r.position === index + 1)?.driver_name
    )
  ) {
    result.breakdown.bonuses.perfectTopTen = 100;
    result.totalScore += 100;
  }
  
  // Correct winner: +20 points (separate from the 25 points for exact placement)
  if (
    betPredictions.length > 0 &&
    betPredictions[0].driver_name === raceResults.find(r => r.position === 1)?.driver_name
  ) {
    result.breakdown.bonuses.correctWinner = 20;
    result.totalScore += 20;
  }
  
  // Fastest lap prediction: +10 points
  if (fastestLap && fastestLap === actualFastestLap) {
    result.breakdown.bonuses.fastestLap = 10;
    result.totalScore += 10;
  }
  
  // Correct DNF prediction: +15 points per correct prediction
  if (dnfPredictions.length > 0) {
    dnfPredictions.forEach(driver => {
      if (actualDNFs.has(driver)) {
        result.breakdown.bonuses.correctDNFs?.push({
          driver,
          points: 15
        });
        result.totalScore += 15;
      }
    });
  }
  
  return result;
}
