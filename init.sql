-- init.sql
-- Créer la table users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  phone VARCHAR(50),
  address TEXT,
  department VARCHAR(100),
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Créer la table countries
CREATE TABLE IF NOT EXISTS countries (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  flag VARCHAR(10),
  operators TEXT[]
);

-- Créer la table senders
CREATE TABLE IF NOT EXISTS senders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  operator VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pending',
  comment TEXT,
  date_created TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  deleted BOOLEAN DEFAULT FALSE,
  is_custom_country BOOLEAN DEFAULT FALSE,
  custom_country TEXT
);

-- Créer la table sender_history
CREATE TABLE IF NOT EXISTS sender_history (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES senders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  sender_id INTEGER REFERENCES senders(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer un utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES (
  'admin@arolisender.civ',
  '$2y$10$ZMTQIZXLADu2BOzJewB0q.6RTlM1pszP0NQgb3DVMcIJ2Tv.Ui62q',
  'Admin',
  'Aroli',
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;
