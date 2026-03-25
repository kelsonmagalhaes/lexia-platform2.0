-- =============================================================================
-- LexStudy - Academia Juridica
-- PostgreSQL Initialization Script
-- Compatible with PostgreSQL 9.6+
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";


-- =============================================================================
-- HELPER FUNCTION: auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- INSTITUTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS institutions (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  is_custom   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_by  UUID,                         -- references users(id), added after users table
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutions_slug ON institutions(slug);
CREATE INDEX IF NOT EXISTS idx_institutions_name  ON institutions USING GIN(name gin_trgm_ops);

CREATE TRIGGER institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(255) NOT NULL,
  email               VARCHAR(255) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  institution_id      UUID         REFERENCES institutions(id) ON DELETE SET NULL,
  institution_custom  VARCHAR(255),
  current_period      SMALLINT     NOT NULL DEFAULT 1 CHECK (current_period BETWEEN 1 AND 10),
  xp                  INTEGER      NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level               VARCHAR(50)  NOT NULL DEFAULT 'junior'
                        CHECK (level IN ('junior', 'bacharel', 'advogado', 'doutor', 'magistrado')),
  streak_days         INTEGER      NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_study_date     DATE,
  avatar_url          VARCHAR(500),
  is_premium          BOOLEAN      NOT NULL DEFAULT FALSE,
  email_verified      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted     ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Back-fill FK on institutions now that users table exists
ALTER TABLE institutions
  ADD CONSTRAINT fk_institutions_created_by
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;


-- =============================================================================
-- REFRESH TOKENS
-- =============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user    ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash    ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active  ON refresh_tokens(user_id, revoked, expires_at)
  WHERE revoked = FALSE;


-- =============================================================================
-- PASSWORD RESETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  used        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);


-- =============================================================================
-- USER CONSENTS  (LGPD)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_consents (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type  VARCHAR(50)  NOT NULL
                  CHECK (consent_type IN ('privacy', 'terms', 'cookies', 'analytics')),
  accepted      BOOLEAN      NOT NULL DEFAULT FALSE,
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  accepted_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

CREATE INDEX IF NOT EXISTS idx_consents_user ON user_consents(user_id);


-- =============================================================================
-- DISCIPLINES
-- =============================================================================
CREATE TABLE IF NOT EXISTS disciplines (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255) NOT NULL,
  period_default  SMALLINT     NOT NULL CHECK (period_default BETWEEN 1 AND 10),
  description     TEXT,
  prerequisites   TEXT[]       NOT NULL DEFAULT '{}',   -- names of prerequisite disciplines
  is_ead          BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disciplines_period ON disciplines(period_default);
CREATE INDEX IF NOT EXISTS idx_disciplines_name   ON disciplines USING GIN(name gin_trgm_ops);


-- =============================================================================
-- CURRICULA  (custom institutional grid)
-- =============================================================================
CREATE TABLE IF NOT EXISTS curricula (
  id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id  UUID      REFERENCES institutions(id) ON DELETE CASCADE,
  period          SMALLINT  NOT NULL CHECK (period BETWEEN 1 AND 10),
  discipline_id   UUID      NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
  display_order   SMALLINT  NOT NULL DEFAULT 0,
  is_custom       BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, period, discipline_id)
);

CREATE INDEX IF NOT EXISTS idx_curricula_institution ON curricula(institution_id);
CREATE INDEX IF NOT EXISTS idx_curricula_discipline  ON curricula(discipline_id);


-- =============================================================================
-- TOPICS
-- =============================================================================
CREATE TABLE IF NOT EXISTS topics (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  discipline_id   UUID         NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  content_md      TEXT,
  display_order   SMALLINT     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_discipline ON topics(discipline_id);

CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- =============================================================================
-- LESSONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS lessons (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id        UUID         NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  content_md      TEXT         NOT NULL,
  duration_min    SMALLINT     NOT NULL DEFAULT 15,
  display_order   SMALLINT     NOT NULL DEFAULT 0,
  xp_reward       INTEGER      NOT NULL DEFAULT 10,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_topic ON lessons(topic_id);

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- =============================================================================
-- QUESTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS questions (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id       UUID         NOT NULL,
  source_type     VARCHAR(20)  NOT NULL
                    CHECK (source_type IN ('lesson', 'topic', 'pdf', 'ai_generated', 'simulado')),
  question_type   VARCHAR(20)  NOT NULL
                    CHECK (question_type IN ('mcq', 'essay', 'true_false')),
  content         TEXT         NOT NULL,
  options         JSONB,           -- [{"key":"A","text":"..."}, ...]
  correct_answer  TEXT         NOT NULL,
  explanation     TEXT,
  difficulty      VARCHAR(20)  NOT NULL DEFAULT 'medium'
                    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  discipline_id   UUID         REFERENCES disciplines(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_source      ON questions(source_id, source_type);
CREATE INDEX IF NOT EXISTS idx_questions_discipline  ON questions(discipline_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty  ON questions(difficulty);


-- =============================================================================
-- USER PROGRESS
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id     UUID         NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status        VARCHAR(20)  NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score         DECIMAL(5,2) CHECK (score BETWEEN 0 AND 100),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user   ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON user_progress(user_id, status);

CREATE TRIGGER progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- =============================================================================
-- QUIZ ATTEMPTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode             VARCHAR(30)  NOT NULL
                     CHECK (mode IN ('lesson', 'topic', 'simulado', 'oab', 'concurso', 'pdf', 'ai')),
  discipline_id    UUID         REFERENCES disciplines(id) ON DELETE SET NULL,
  questions        JSONB        NOT NULL,   -- [{questionId, content, options, difficulty}]
  answers          JSONB,                   -- {questionId: selectedKey}
  score            DECIMAL(5,2) CHECK (score BETWEEN 0 AND 100),
  total_questions  INTEGER      NOT NULL,
  correct_answers  INTEGER,
  duration_seconds INTEGER,
  completed        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quiz_user       ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_discipline ON quiz_attempts(discipline_id);
CREATE INDEX IF NOT EXISTS idx_quiz_created    ON quiz_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_completed  ON quiz_attempts(user_id, completed);


-- =============================================================================
-- STUDY SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discipline_id  UUID         REFERENCES disciplines(id) ON DELETE SET NULL,
  started_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  ended_at       TIMESTAMPTZ,
  xp_earned      INTEGER      NOT NULL DEFAULT 0 CHECK (xp_earned >= 0)
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(user_id, started_at);


-- =============================================================================
-- GAMIFICATION HISTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS gamification_history (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type  VARCHAR(50) NOT NULL,
  xp_delta    INTEGER     NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gamification_user  ON gamification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_event ON gamification_history(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_gamification_date  ON gamification_history(created_at);


-- =============================================================================
-- VADE MECUM ARTICLES  (local cache with full-text search)
-- =============================================================================
CREATE TABLE IF NOT EXISTS vade_mecum_articles (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_code         VARCHAR(20)  NOT NULL,
  article_number   VARCHAR(20)  NOT NULL,
  article_text     TEXT         NOT NULL,
  simplified_text  TEXT,
  search_vector    TSVECTOR,
  fetched_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(law_code, article_number)
);

CREATE INDEX IF NOT EXISTS idx_vade_mecum_search ON vade_mecum_articles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_vade_mecum_law    ON vade_mecum_articles(law_code, article_number);

-- Function to maintain the tsvector column
CREATE OR REPLACE FUNCTION update_vade_mecum_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('portuguese',
      COALESCE(unaccent(NEW.article_text), '') || ' ' ||
      COALESCE(unaccent(NEW.simplified_text), '')
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vade_mecum_search_trigger
  BEFORE INSERT OR UPDATE ON vade_mecum_articles
  FOR EACH ROW EXECUTE PROCEDURE update_vade_mecum_search_vector();


-- =============================================================================
-- VADE MECUM FAVORITES
-- =============================================================================
CREATE TABLE IF NOT EXISTS vade_mecum_favorites (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  law_code        VARCHAR(20)  NOT NULL,
  article_number  VARCHAR(20)  NOT NULL,
  article_text    TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, law_code, article_number)
);

CREATE INDEX IF NOT EXISTS idx_vade_fav_user ON vade_mecum_favorites(user_id);


-- =============================================================================
-- PDF UPLOADS
-- =============================================================================
CREATE TABLE IF NOT EXISTS pdf_uploads (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename         VARCHAR(255) NOT NULL,
  cloudinary_url   VARCHAR(500),
  file_size_bytes  INTEGER,
  status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'processing', 'done', 'error')),
  discipline_id    UUID         REFERENCES disciplines(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdf_uploads_user   ON pdf_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_uploads_status ON pdf_uploads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pdf_uploads_date   ON pdf_uploads(created_at);


-- =============================================================================
-- PDF RESULTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS pdf_results (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  pdf_id      UUID        NOT NULL REFERENCES pdf_uploads(id) ON DELETE CASCADE UNIQUE,
  summary_md  TEXT,
  quiz        JSONB,      -- {"questions":[{content, options, correctAnswer, explanation}]}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- GOALS
-- =============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(255)  NOT NULL,
  target_value   DECIMAL(10,2) NOT NULL CHECK (target_value > 0),
  current_value  DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  unit           VARCHAR(50)   NOT NULL,
  deadline       DATE,
  done           BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_done ON goals(user_id, done);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Default institution
-- ---------------------------------------------------------------------------
INSERT INTO institutions (id, name, slug, is_custom)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'LexStudy - Instituição Padrão',
  'lexstudy-padrao',
  FALSE
)
ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- Disciplines  (DEFAULT_CURRICULUM — 10 periodos, 59 disciplinas)
-- ---------------------------------------------------------------------------

-- 1º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Introdução à Ciência Jurídica',        1, FALSE, '{}'),
  ('Português Jurídico',                   1, FALSE, '{}'),
  ('Metodologia de Pesquisa Científica',   1, FALSE, '{}'),
  ('Psicologia e Proficiência Acadêmica',  1, FALSE, '{}'),
  ('Introdução ao Pensamento Filosófico',  1, FALSE, '{}'),
  ('Sociologia e Antropologia',            1, FALSE, '{}'),
  ('Teoria Geral do Estado e Ciência Política', 1, FALSE, '{}')
ON CONFLICT DO NOTHING;

-- 2º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Filosofia do Direito',                 2, FALSE, ARRAY['Introdução ao Pensamento Filosófico']),
  ('História do Direito',                  2, TRUE,  '{}'),
  ('Sociologia Jurídica',                  2, FALSE, ARRAY['Sociologia e Antropologia']),
  ('Direito Constitucional I',             2, FALSE, ARRAY['Teoria Geral do Estado e Ciência Política']),
  ('Direito Civil I (Parte Geral)',         2, FALSE, ARRAY['Introdução à Ciência Jurídica']),
  ('Teoria Geral do Direito',              2, FALSE, ARRAY['Introdução à Ciência Jurídica']),
  ('Direito Penal I',                      2, FALSE, ARRAY['Introdução à Ciência Jurídica'])
ON CONFLICT DO NOTHING;

-- 3º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Hermenêutica Jurídica',                3, FALSE, ARRAY['Teoria Geral do Direito']),
  ('Economia',                             3, TRUE,  '{}'),
  ('Direito Constitucional II',            3, FALSE, ARRAY['Direito Constitucional I']),
  ('Direito Civil II (Obrigações)',         3, FALSE, ARRAY['Direito Civil I (Parte Geral)']),
  ('Teoria Geral do Processo',             3, FALSE, ARRAY['Teoria Geral do Direito']),
  ('Direito Penal II',                     3, FALSE, ARRAY['Direito Penal I'])
ON CONFLICT DO NOTHING;

-- 4º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Direito Constitucional III',           4, FALSE, ARRAY['Direito Constitucional II']),
  ('Direitos Humanos',                     4, FALSE, ARRAY['Direito Constitucional II']),
  ('Direito Civil III (Responsabilidade Civil e Contratos I)', 4, FALSE, ARRAY['Direito Civil II (Obrigações)']),
  ('Direito Processual Civil I',           4, FALSE, ARRAY['Teoria Geral do Processo']),
  ('Direito Penal III',                    4, FALSE, ARRAY['Direito Penal II'])
ON CONFLICT DO NOTHING;

-- 5º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Direito Civil IV (Contratos II)',       5, FALSE, ARRAY['Direito Civil III (Responsabilidade Civil e Contratos I)']),
  ('Direito Processual Civil II',          5, FALSE, ARRAY['Direito Processual Civil I']),
  ('Direito Processual Penal I',           5, FALSE, ARRAY['Direito Penal III', 'Teoria Geral do Processo']),
  ('Direito Empresarial I',                5, FALSE, ARRAY['Direito Civil II (Obrigações)']),
  ('Direito Administrativo I',             5, FALSE, ARRAY['Direito Constitucional II'])
ON CONFLICT DO NOTHING;

-- 6º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Direito Civil V (Direito das Coisas)', 6, FALSE, ARRAY['Direito Civil IV (Contratos II)']),
  ('Direito Processual Civil III',         6, FALSE, ARRAY['Direito Processual Civil II']),
  ('Direito Processual Penal II',          6, FALSE, ARRAY['Direito Processual Penal I']),
  ('Direito do Trabalho I',                6, FALSE, ARRAY['Direito Constitucional II']),
  ('Direito Empresarial II',               6, FALSE, ARRAY['Direito Empresarial I']),
  ('Direito Administrativo II',            6, FALSE, ARRAY['Direito Administrativo I'])
ON CONFLICT DO NOTHING;

-- 7º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Direito Civil VI (Direito de Família)',6, FALSE, ARRAY['Direito Civil V (Direito das Coisas)']),
  ('Direito Processual Civil IV',          7, FALSE, ARRAY['Direito Processual Civil III']),
  ('Direito do Trabalho II',               7, FALSE, ARRAY['Direito do Trabalho I']),
  ('Direito Empresarial III',              7, FALSE, ARRAY['Direito Empresarial II']),
  ('Estágio I - Prática Simulada Penal',   7, FALSE, ARRAY['Direito Processual Penal II']),
  ('Estágio I - Prática Real',             7, FALSE, ARRAY['Direito Processual Penal II'])
ON CONFLICT DO NOTHING;

-- 8º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Direito Civil VII (Sucessões)',        8, FALSE, ARRAY['Direito Civil VI (Direito de Família)']),
  ('Direito Processual do Trabalho I',     8, FALSE, ARRAY['Direito do Trabalho II']),
  ('Direito Tributário I',                 8, FALSE, ARRAY['Direito Administrativo II']),
  ('Ética Profissional',                   8, FALSE, ARRAY['Direito Civil I (Parte Geral)']),
  ('Estágio II - Prática Simulada Civil',  8, FALSE, ARRAY['Direito Processual Civil IV']),
  ('Estágio II - Prática Real',            8, FALSE, ARRAY['Direito Processual Civil IV']),
  ('Direito do Trabalho III',              8, FALSE, ARRAY['Direito do Trabalho II']),
  ('TCC (Trabalho de Conclusão de Curso)', 8, FALSE, ARRAY['Metodologia de Pesquisa Científica'])
ON CONFLICT DO NOTHING;

-- 9º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Direito Internacional I',              9, FALSE, ARRAY['Direito Constitucional III', 'Direitos Humanos']),
  ('Direito Tributário II',                9, FALSE, ARRAY['Direito Tributário I']),
  ('Direito do Consumidor',                9, FALSE, ARRAY['Direito Civil IV (Contratos II)']),
  ('Direito Ambiental I',                  9, FALSE, ARRAY['Direito Administrativo II']),
  ('Direito Processual do Trabalho II',    9, FALSE, ARRAY['Direito Processual do Trabalho I']),
  ('Estágio III - Prática Simulada Trabalho', 9, FALSE, ARRAY['Direito Processual do Trabalho I']),
  ('Estágio III - Prática Real Trabalho',  9, FALSE, ARRAY['Direito Processual do Trabalho I'])
ON CONFLICT DO NOTHING;

-- 10º Período
INSERT INTO disciplines (name, period_default, is_ead, prerequisites) VALUES
  ('Direito Ambiental II',                 10, FALSE, ARRAY['Direito Ambiental I']),
  ('Direito e Tecnologia na Contemporaneidade', 10, FALSE, ARRAY['Direito Civil I (Parte Geral)']),
  ('Direito Financeiro',                   10, FALSE, ARRAY['Direito Tributário II']),
  ('Direito Internacional II',             10, FALSE, ARRAY['Direito Internacional I']),
  ('Direito Previdenciário',               10, FALSE, ARRAY['Direito do Trabalho III']),
  ('Estágio IV - Prática Real (Área Adm. Pública e Dir. Difusos)', 10, FALSE, ARRAY['Direito Administrativo II', 'Direito Ambiental I']),
  ('Estágio IV - Prática Simulada',        10, FALSE, ARRAY['Direito Administrativo II']),
  ('Mediação, Conciliação e Arbitragem',   10, FALSE, ARRAY['Teoria Geral do Processo']),
  ('Tópicos em Controle de Constitucionalidade', 10, FALSE, ARRAY['Direito Constitucional III'])
ON CONFLICT DO NOTHING;

