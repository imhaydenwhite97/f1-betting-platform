import { D1Database } from '@cloudflare/workers-types';

export interface Race {
  id: number;
  name: string;
  location: string;
  date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  created_at: string;
}

export interface RaceResult {
  race_id: number;
  position: number;
  driver_name: string;
  team: string;
  fastest_lap: boolean;
  dnf: boolean;
}

export async function getAllRaces(db: D1Database): Promise<Race[]> {
  try {
    const races = await db.prepare(
      'SELECT * FROM races ORDER BY date ASC'
    ).all<Race>();
    
    return races.results;
  } catch (error) {
    console.error('Error fetching races:', error);
    return [];
  }
}

export async function getUpcomingRaces(db: D1Database): Promise<Race[]> {
  try {
    const races = await db.prepare(
      'SELECT * FROM races WHERE status = "upcoming" ORDER BY date ASC'
    ).all<Race>();
    
    return races.results;
  } catch (error) {
    console.error('Error fetching upcoming races:', error);
    return [];
  }
}

export async function getRaceById(db: D1Database, raceId: number): Promise<Race | null> {
  try {
    const race = await db.prepare(
      'SELECT * FROM races WHERE id = ?'
    )
    .bind(raceId)
    .first<Race>();
    
    return race || null;
  } catch (error) {
    console.error('Error fetching race:', error);
    return null;
  }
}

export async function createRace(
  db: D1Database,
  name: string,
  location: string,
  date: string,
  status: 'upcoming' | 'in_progress' | 'completed' = 'upcoming'
): Promise<Race | null> {
  try {
    const result = await db.prepare(
      'INSERT INTO races (name, location, date, status) VALUES (?, ?, ?, ?) RETURNING *'
    )
    .bind(name, location, date, status)
    .first<Race>();
    
    return result || null;
  } catch (error) {
    console.error('Error creating race:', error);
    return null;
  }
}

export async function updateRaceStatus(
  db: D1Database,
  raceId: number,
  status: 'upcoming' | 'in_progress' | 'completed'
): Promise<boolean> {
  try {
    const result = await db.prepare(
      'UPDATE races SET status = ? WHERE id = ?'
    )
    .bind(status, raceId)
    .run();
    
    return result.success;
  } catch (error) {
    console.error('Error updating race status:', error);
    return false;
  }
}

export async function saveRaceResults(
  db: D1Database,
  raceId: number,
  results: { position: number; driver_name: string; team: string; fastest_lap?: boolean; dnf?: boolean }[]
): Promise<boolean> {
  try {
    // First, delete any existing results for this race
    await db.prepare(
      'DELETE FROM race_results WHERE race_id = ?'
    )
    .bind(raceId)
    .run();
    
    // Then insert the new results
    for (const result of results) {
      await db.prepare(
        'INSERT INTO race_results (race_id, position, driver_name, team, fastest_lap, dnf) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(
        raceId,
        result.position,
        result.driver_name,
        result.team,
        result.fastest_lap || false,
        result.dnf || false
      )
      .run();
    }
    
    // Update race status to completed
    await updateRaceStatus(db, raceId, 'completed');
    
    return true;
  } catch (error) {
    console.error('Error saving race results:', error);
    return false;
  }
}

export async function getRaceResults(db: D1Database, raceId: number): Promise<RaceResult[]> {
  try {
    const results = await db.prepare(
      'SELECT * FROM race_results WHERE race_id = ? ORDER BY position ASC'
    )
    .bind(raceId)
    .all<RaceResult>();
    
    return results.results;
  } catch (error) {
    console.error('Error fetching race results:', error);
    return [];
  }
}
