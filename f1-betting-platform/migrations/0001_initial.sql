-- Migration number: 0001 	 2025-03-26
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS races;
DROP TABLE IF EXISTS race_results;
DROP TABLE IF EXISTS bets;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS wager_groups;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS counters;
DROP TABLE IF EXISTS access_logs;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- F1 Races table
CREATE TABLE IF NOT EXISTS races (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATETIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, in_progress, completed
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Race results table
CREATE TABLE IF NOT EXISTS race_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  race_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  driver_name TEXT NOT NULL,
  team TEXT NOT NULL,
  fastest_lap BOOLEAN NOT NULL DEFAULT 0,
  dnf BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (race_id) REFERENCES races(id)
);

-- Wager groups for private betting
CREATE TABLE IF NOT EXISTS wager_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  owner_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES wager_groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(group_id, user_id)
);

-- Invitations to wager groups
CREATE TABLE IF NOT EXISTS invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (group_id) REFERENCES wager_groups(id)
);

-- Bets placed by users
CREATE TABLE IF NOT EXISTS bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  race_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  prediction TEXT NOT NULL, -- JSON string containing driver predictions
  fastest_lap TEXT,
  dnf_prediction TEXT, -- JSON array of predicted DNFs
  score INTEGER DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (race_id) REFERENCES races(id),
  FOREIGN KEY (group_id) REFERENCES wager_groups(id),
  UNIQUE(user_id, race_id, group_id)
);

-- System counters
CREATE TABLE IF NOT EXISTS counters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Access logs
CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  path TEXT,
  user_id INTEGER,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_races_date ON races(date);
CREATE INDEX idx_race_results_race_id ON race_results(race_id);
CREATE INDEX idx_bets_race_id ON bets(race_id);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_group_id ON bets(group_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_access_logs_accessed_at ON access_logs(accessed_at);
CREATE INDEX idx_counters_name ON counters(name);

-- Initial data
INSERT INTO counters (name, value) VALUES 
  ('page_views', 0),
  ('api_calls', 0);

-- Insert sample races for testing
INSERT INTO races (name, location, date, status) VALUES
  ('Bahrain Grand Prix', 'Bahrain International Circuit', '2025-03-02 15:00:00', 'completed'),
  ('Saudi Arabian Grand Prix', 'Jeddah Corniche Circuit', '2025-03-09 18:00:00', 'completed'),
  ('Australian Grand Prix', 'Albert Park Circuit', '2025-03-24 05:00:00', 'completed'),
  ('Japanese Grand Prix', 'Suzuka International Racing Course', '2025-04-07 06:00:00', 'upcoming'),
  ('Chinese Grand Prix', 'Shanghai International Circuit', '2025-04-21 08:00:00', 'upcoming');

-- Insert sample race results for completed races
INSERT INTO race_results (race_id, position, driver_name, team, fastest_lap, dnf) VALUES
  -- Bahrain Grand Prix results
  (1, 1, 'Max Verstappen', 'Red Bull Racing', 1, 0),
  (1, 2, 'Charles Leclerc', 'Ferrari', 0, 0),
  (1, 3, 'Carlos Sainz', 'Ferrari', 0, 0),
  (1, 4, 'Lewis Hamilton', 'Mercedes', 0, 0),
  (1, 5, 'Sergio Perez', 'Red Bull Racing', 0, 0),
  (1, 6, 'George Russell', 'Mercedes', 0, 0),
  (1, 7, 'Lando Norris', 'McLaren', 0, 0),
  (1, 8, 'Oscar Piastri', 'McLaren', 0, 0),
  (1, 9, 'Fernando Alonso', 'Aston Martin', 0, 0),
  (1, 10, 'Lance Stroll', 'Aston Martin', 0, 0),
  -- Saudi Arabian Grand Prix results
  (2, 1, 'Max Verstappen', 'Red Bull Racing', 0, 0),
  (2, 2, 'Sergio Perez', 'Red Bull Racing', 0, 0),
  (2, 3, 'Charles Leclerc', 'Ferrari', 1, 0),
  (2, 4, 'Carlos Sainz', 'Ferrari', 0, 0),
  (2, 5, 'Lewis Hamilton', 'Mercedes', 0, 0),
  (2, 6, 'Lando Norris', 'McLaren', 0, 0),
  (2, 7, 'Oscar Piastri', 'McLaren', 0, 0),
  (2, 8, 'George Russell', 'Mercedes', 0, 0),
  (2, 9, 'Fernando Alonso', 'Aston Martin', 0, 0),
  (2, 10, 'Nico Hulkenberg', 'Haas F1 Team', 0, 0),
  -- Australian Grand Prix results
  (3, 1, 'Charles Leclerc', 'Ferrari', 0, 0),
  (3, 2, 'Carlos Sainz', 'Ferrari', 0, 0),
  (3, 3, 'Lando Norris', 'McLaren', 1, 0),
  (3, 4, 'Oscar Piastri', 'McLaren', 0, 0),
  (3, 5, 'George Russell', 'Mercedes', 0, 0),
  (3, 6, 'Sergio Perez', 'Red Bull Racing', 0, 0),
  (3, 7, 'Fernando Alonso', 'Aston Martin', 0, 0),
  (3, 8, 'Lance Stroll', 'Aston Martin', 0, 0),
  (3, 9, 'Yuki Tsunoda', 'RB', 0, 0),
  (3, 10, 'Nico Hulkenberg', 'Haas F1 Team', 0, 0),
  (3, 11, 'Max Verstappen', 'Red Bull Racing', 0, 1),
  (3, 12, 'Lewis Hamilton', 'Mercedes', 0, 1);
