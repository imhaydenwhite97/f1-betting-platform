-- Create tables for our F1 betting platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table that extends the auth.users table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL, -- Added email column
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create races table
CREATE TABLE races (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, in_progress, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE drivers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create betting_groups table
CREATE TABLE betting_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES betting_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- admin, member
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create invitations table
CREATE TABLE invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES betting_groups(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, email)
);

-- Create race_results table
CREATE TABLE race_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  race_id UUID REFERENCES races(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  position INTEGER,
  dnf BOOLEAN DEFAULT FALSE,
  fastest_lap BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(race_id, driver_id)
);

-- Create bets table
CREATE TABLE bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  race_id UUID REFERENCES races(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES betting_groups(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(race_id, user_id, group_id)
);

-- Create bet_details table
CREATE TABLE bet_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  predicted_position INTEGER NOT NULL,
  predicted_dnf BOOLEAN DEFAULT FALSE,
  predicted_fastest_lap BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bet_id, driver_id)
);

-- Create bet_scores table
CREATE TABLE bet_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bet_id)
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Races are viewable by everyone
CREATE POLICY "Races are viewable by everyone." ON races
  FOR SELECT USING (true);

-- Drivers are viewable by everyone
CREATE POLICY "Drivers are viewable by everyone." ON drivers
  FOR SELECT USING (true);

-- Betting groups policies
CREATE POLICY "Betting groups are viewable by members" ON betting_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = betting_groups.id
      AND group_members.user_id = auth.uid()
    )
    OR
    NOT is_private
  );

CREATE POLICY "Users can create betting groups" ON betting_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update betting groups" ON betting_groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = betting_groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- Group members policies
CREATE POLICY "Group members are viewable by other members" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members AS gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- Invitations policies
CREATE POLICY "Invitations are viewable by group admins" ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = invitations.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own invitations" ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = invitations.email
    )
  );

-- Race results are viewable by everyone
CREATE POLICY "Race results are viewable by everyone." ON race_results
  FOR SELECT USING (true);

-- Bets policies
CREATE POLICY "Bets are viewable by group members" ON bets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = bets.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own bets" ON bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bets" ON bets
  FOR UPDATE USING (auth.uid() = user_id);

-- Bet details policies
CREATE POLICY "Bet details are viewable by group members" ON bet_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bets
      JOIN group_members ON bets.group_id = group_members.group_id
      WHERE bet_details.bet_id = bets.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Bet scores policies
CREATE POLICY "Bet scores are viewable by group members" ON bet_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bets
      JOIN group_members ON bets.group_id = group_members.group_id
      WHERE bet_scores.bet_id = bets.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION calculate_bet_score(bet_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
  race_id UUID;
  driver_record RECORD;
  bet_position INTEGER;
  actual_position INTEGER;
  position_diff INTEGER;
  predicted_dnf BOOLEAN;
  actual_dnf BOOLEAN;
  predicted_fastest_lap BOOLEAN;
  actual_fastest_lap BOOLEAN;
  correct_podium BOOLEAN := TRUE;
  correct_top5 BOOLEAN := TRUE;
  correct_top10 BOOLEAN := TRUE;
  correct_winner BOOLEAN := FALSE;
  details_json JSONB := '{}'::JSONB;
BEGIN
  -- Get the race_id for this bet
  SELECT bets.race_id INTO race_id FROM bets WHERE bets.id = bet_id;
  
  -- Loop through each driver in the bet
  FOR driver_record IN (
    SELECT 
      bd.driver_id,
      bd.predicted_position,
      bd.predicted_dnf,
      bd.predicted_fastest_lap,
      rr.position AS actual_position,
      rr.dnf AS actual_dnf,
      rr.fastest_lap AS actual_fastest_lap
    FROM bet_details bd
    JOIN race_results rr ON bd.driver_id = rr.driver_id AND rr.race_id = race_id
    WHERE bd.bet_id = bet_id
  ) LOOP
    bet_position := driver_record.predicted_position;
    actual_position := driver_record.actual_position;
    predicted_dnf := driver_record.predicted_dnf;
    actual_dnf := driver_record.actual_dnf;
    predicted_fastest_lap := driver_record.predicted_fastest_lap;
    actual_fastest_lap := driver_record.actual_fastest_lap;
    
    -- Calculate position difference
    IF actual_position IS NOT NULL AND NOT actual_dnf THEN
      position_diff := ABS(bet_position - actual_position);
      
      -- Scoring based on position accuracy
      CASE
        WHEN position_diff = 0 THEN
          total_score := total_score + 25; -- Exact position
          details_json := jsonb_set(details_json, ARRAY[driver_record.driver_id::text], 
                          jsonb_build_object('points', 25, 'reason', 'Exact position'));
        WHEN position_diff = 1 THEN
          total_score := total_score + 15; -- One position off
          details_json := jsonb_set(details_json, ARRAY[driver_record.driver_id::text], 
                          jsonb_build_object('points', 15, 'reason', 'One position off'));
        WHEN position_diff = 2 THEN
          total_score := total_score + 10; -- Two positions off
          details_json := jsonb_set(details_json, ARRAY[driver_record.driver_id::text], 
                          jsonb_build_object('points', 10, 'reason', 'Two positions off'));
        WHEN position_diff = 3 THEN
          total_score := total_score + 5; -- Three positions off
          details_json := jsonb_set(details_json, ARRAY[driver_record.driver_id::text], 
                          jsonb_build_object('points', 5, 'reason', 'Three positions off'));
        WHEN actual_position <= 10 THEN
          total_score := total_score + 2; -- In top 10 but wrong spot
          details_json := jsonb_set(details_json, ARRAY[driver_record.driver_id::text], 
                          jsonb_build_object('points', 2, 'reason', 'In top 10 but wrong spot'));
        ELSE
          total_score := total_score - 5; -- Not in top 10 at all
          details_json := jsonb_set(details_json, ARRAY[driver_record.driver_id::text], 
                          jsonb_build_object('points', -5, 'reason', 'Not in top 10'));
      END CASE;
      
      -- Check for correct winner
      IF bet_position = 1 AND actual_position = 1 THEN
        correct_winner := TRUE;
        total_score := total_score + 20; -- Correct winner bonus
        details_json := jsonb_set(details_json, ARRAY['bonus_correct_winner'], to_jsonb(20));
      END IF;
      
      -- Check for correct podium/top5/top10
      IF (bet_position <= 3 AND actual_position <= 3) AND position_diff > 0 THEN
        correct_podium := FALSE;
      END IF;
      
      IF (bet_position <= 5 AND actual_position <= 5) AND position_diff > 0 THEN
        correct_top5 := FALSE;
      END IF;
      
      IF (bet_position <= 10 AND actual_position <= 10) AND position_diff > 0 THEN
        correct_top10 := FALSE;
      END IF;
    END IF;
    
    -- DNF prediction
    IF predicted_dnf = actual_dnf AND actual_dnf = TRUE THEN
      total_score := total_score + 15; -- Correct DNF prediction
      details_json := jsonb_set(details_json, ARRAY[driver_record.driver_id::text, 'dnf'], 
                      jsonb_build_object('points', 15, 'reason', 'Correct DNF prediction'));
    END IF;
    
    -- Fastest lap prediction
    IF predicted_fastest_lap = actual_fastest_lap AND actual_fastest_lap = TRUE THEN
      total_score := total_score + 10; -- Correct fastest lap prediction
      details_json := jsonb_set(details_json, ARRAY[driver_record.driver_id::text, 'fastest_lap'], 
                      jsonb_build_object('points', 10, 'reason', 'Correct fastest lap prediction'));
    END IF;
  END LOOP;
  
  -- Add bonus points for perfect predictions
  IF correct_podium THEN
    total_score := total_score + 30; -- Perfect podium
    details_json := jsonb_set(details_json, ARRAY['bonus_perfect_podium'], to_jsonb(30));
  END IF;
  
  IF correct_top5 THEN
    total_score := total_score + 50; -- Perfect top 5
    details_json := jsonb_set(details_json, ARRAY['bonus_perfect_top5'], to_jsonb(50));
  END IF;
  
  IF correct_top10 THEN
    total_score := total_score + 100; -- Perfect top 10
    details_json := jsonb_set(details_json, ARRAY['bonus_perfect_top10'], to_jsonb(100));
  END IF;
  
  -- Update the bet_scores table
  INSERT INTO bet_scores (bet_id, score, details)
  VALUES (bet_id, total_score, details_json)
  ON CONFLICT (bet_id) 
  DO UPDATE SET 
    score = total_score,
    details = details_json,
    updated_at = NOW();
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate score when race results are updated
CREATE OR REPLACE FUNCTION trigger_calculate_bet_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- When race results are updated, recalculate scores for all bets for this race
  IF TG_TABLE_NAME = 'race_results' THEN
    UPDATE races SET status = 'completed' WHERE id = NEW.race_id;
    
    -- Calculate scores for all bets for this race
    PERFORM calculate_bet_score(bets.id)
    FROM bets
    WHERE bets.race_id = NEW.race_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_bet_scores_trigger
AFTER INSERT OR UPDATE ON race_results
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_bet_scores();

-- Insert some initial F1 drivers data
INSERT INTO drivers (name, team, number) VALUES
('Max Verstappen', 'Red Bull Racing', 1),
('Sergio Perez', 'Red Bull Racing', 11),
('Lewis Hamilton', 'Mercedes', 44),
('George Russell', 'Mercedes', 63),
('Charles Leclerc', 'Ferrari', 16),
('Carlos Sainz', 'Ferrari', 55),
('Lando Norris', 'McLaren', 4),
('Oscar Piastri', 'McLaren', 81),
('Fernando Alonso', 'Aston Martin', 14),
('Lance Stroll', 'Aston Martin', 18),
('Esteban Ocon', 'Alpine', 31),
('Pierre Gasly', 'Alpine', 10),
('Daniel Ricciardo', 'RB', 3),
('Yuki Tsunoda', 'RB', 22),
('Zhou Guanyu', 'Kick Sauber', 24),
('Valtteri Bottas', 'Kick Sauber', 77),
('Kevin Magnussen', 'Haas F1 Team', 20),
('Nico Hulkenberg', 'Haas F1 Team', 27),
('Alexander Albon', 'Williams', 23),
('Logan Sargeant', 'Williams', 2);

-- Insert some upcoming races
INSERT INTO races (name, location, date, status) VALUES
('Bahrain Grand Prix', 'Bahrain International Circuit', '2024-03-02 15:00:00+00', 'completed'),
('Saudi Arabian Grand Prix', 'Jeddah Corniche Circuit', '2024-03-09 17:00:00+00', 'completed'),
('Australian Grand Prix', 'Albert Park Circuit', '2024-03-24 05:00:00+00', 'completed'),
('Japanese Grand Prix', 'Suzuka International Racing Course', '2024-04-07 06:00:00+00', 'completed'),
('Chinese Grand Prix', 'Shanghai International Circuit', '2024-04-21 07:00:00+00', 'upcoming'),
('Miami Grand Prix', 'Miami International Autodrome', '2024-05-05 20:00:00+00', 'upcoming'),
('Emilia Romagna Grand Prix', 'Autodromo Enzo e Dino Ferrari', '2024-05-19 13:00:00+00', 'upcoming'),
('Monaco Grand Prix', 'Circuit de Monaco', '2024-05-26 13:00:00+00', 'upcoming');

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
