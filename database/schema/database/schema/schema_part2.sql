-- 2. password_reset_tokens
CREATE TABLE password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW());

-- 3. alarms
CREATE TABLE alarms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  alarm_type VARCHAR(20) DEFAULT 'daily',
  days_of_week INTEGER[],
  is_active BOOLEAN DEFAULT true,
  label VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW());

-- 4. alarm_triggers
CREATE TABLE alarm_triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alarm_id UUID NOT NULL REFERENCES alarms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP DEFAULT NOW(),
  dismissed_at TIMESTAMP,
  verification_status VARCHAR(20) DEFAULT 'pending',
  snooze_count INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0);

-- 5. challenges
CREATE TABLE challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  goal_type VARCHAR(20),
  difficulty VARCHAR(20) DEFAULT 'beginner',
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  source VARCHAR(20) DEFAULT 'question_bank',
  embedding_ref VARCHAR(120),
  created_at TIMESTAMP DEFAULT NOW());

-- 6. notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(60) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP);
