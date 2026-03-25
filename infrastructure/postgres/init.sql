-- LexStudy - Academia Jurídica
-- Database Initialization Script

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ===========================
-- INSTITUTIONS
-- ===========================
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- USERS
-- ===========================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  institution_custom VARCHAR(255),
  current_period SMALLINT NOT NULL DEFAULT 1 CHECK (current_period BETWEEN 1 AND 10),
  xp INTEGER NOT NULL DEFAULT 0,
  level VARCHAR(50) NOT NULL DEFAULT 'junior',
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  avatar_url VARCHAR(500),
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted ON users(deleted_at);

-- ===========================
-- REFRESH TOKENS
-- ===========================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ===========================
-- PASSWORD RESETS
-- ===========================
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- USER CONSENTS (LGPD)
-- ===========================
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('privacy', 'terms', 'cookies', 'analytics')),
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

-- ===========================
-- DISCIPLINES
-- ===========================
CREATE TABLE IF NOT EXISTS disciplines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  period_default SMALLINT NOT NULL CHECK (period_default BETWEEN 1 AND 10),
  description TEXT,
  prerequisites UUID[] DEFAULT '{}',
  is_ead BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- CURRICULA (grade personalizada)
-- ===========================
CREATE TABLE IF NOT EXISTS curricula (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  period SMALLINT NOT NULL CHECK (period BETWEEN 1 AND 10),
  discipline_id UUID NOT NULL REFERENCES disciplines(id),
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, period, discipline_id)
);

-- ===========================
-- TOPICS
-- ===========================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discipline_id UUID NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_md TEXT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- LESSONS
-- ===========================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_md TEXT NOT NULL,
  duration_min SMALLINT NOT NULL DEFAULT 15,
  display_order SMALLINT NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- QUESTIONS
-- ===========================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL,
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('lesson', 'topic', 'pdf', 'ai_generated', 'simulado')),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq', 'essay', 'true_false')),
  content TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  discipline_id UUID REFERENCES disciplines(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_source ON questions(source_id, source_type);
CREATE INDEX idx_questions_discipline ON questions(discipline_id);

-- ===========================
-- USER PROGRESS
-- ===========================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score DECIMAL(5,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_progress_user ON user_progress(user_id);

-- ===========================
-- QUIZ ATTEMPTS
-- ===========================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode VARCHAR(30) NOT NULL CHECK (mode IN ('lesson', 'topic', 'simulado', 'oab', 'concurso', 'pdf', 'ai')),
  discipline_id UUID REFERENCES disciplines(id),
  questions JSONB NOT NULL,
  answers JSONB,
  score DECIMAL(5,2),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER,
  duration_seconds INTEGER,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_quiz_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_created ON quiz_attempts(created_at);

-- ===========================
-- STUDY SESSIONS
-- ===========================
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discipline_id UUID REFERENCES disciplines(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  xp_earned INTEGER NOT NULL DEFAULT 0
);

-- ===========================
-- GAMIFICATION HISTORY
-- ===========================
CREATE TABLE IF NOT EXISTS gamification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  xp_delta INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gamification_user ON gamification_history(user_id);

-- ===========================
-- VADE MECUM FAVORITES
-- ===========================
CREATE TABLE IF NOT EXISTS vade_mecum_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  law_code VARCHAR(20) NOT NULL,
  article_number VARCHAR(20) NOT NULL,
  article_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, law_code, article_number)
);

-- ===========================
-- VADE MECUM ARTICLES (cache local)
-- ===========================
CREATE TABLE IF NOT EXISTS vade_mecum_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_code VARCHAR(20) NOT NULL,
  article_number VARCHAR(20) NOT NULL,
  article_text TEXT NOT NULL,
  simplified_text TEXT,
  search_vector TSVECTOR,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(law_code, article_number)
);

CREATE INDEX idx_vade_mecum_search ON vade_mecum_articles USING GIN(search_vector);
CREATE INDEX idx_vade_mecum_law ON vade_mecum_articles(law_code, article_number);

-- Função para atualizar search_vector
CREATE OR REPLACE FUNCTION update_vade_mecum_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese', 
    COALESCE(NEW.article_text, '') || ' ' || 
    COALESCE(NEW.simplified_text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vade_mecum_search_trigger
BEFORE INSERT OR UPDATE ON vade_mecum_articles
FOR EACH ROW EXECUTE FUNCTION update_vade_mecum_search_vector();

-- ===========================
-- PDF UPLOADS
-- ===========================
CREATE TABLE IF NOT EXISTS pdf_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  cloudinary_url VARCHAR(500),
  file_size_bytes INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
  discipline_id UUID REFERENCES disciplines(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- PDF RESULTS
-- ===========================
CREATE TABLE IF NOT EXISTS pdf_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pdf_id UUID NOT NULL REFERENCES pdf_uploads(id) ON DELETE CASCADE UNIQUE,
  summary_md TEXT,
  quiz JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- GOALS
-- ===========================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  deadline DATE,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goals_user ON goals(user_id);

-- ===========================
-- UPDATED_AT TRIGGER
-- ===========================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
