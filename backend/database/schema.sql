-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) NOT NULL UNIQUE,
  email VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'user',
  avatar VARCHAR(255),
  banner VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица манги
CREATE TABLE IF NOT EXISTS manga (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_original VARCHAR(255),
  description TEXT NOT NULL,
  cover_image VARCHAR(255),
  status VARCHAR(16) NOT NULL,
  genres TEXT[] NOT NULL,
  author VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  year INT,
  rating FLOAT DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица глав
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  manga_id INT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
  chapter_number FLOAT NOT NULL,
  title VARCHAR(255),
  pages TEXT[] DEFAULT '{}',
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица страниц главы
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  chapter_id INT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  image_path VARCHAR(255) NOT NULL,
  page_number INT NOT NULL
);

-- Избранное
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manga_id INT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- История чтения
CREATE TABLE IF NOT EXISTS reading_history (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manga_id INT NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
  chapter_id INT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- История изменений манги
CREATE TABLE IF NOT EXISTS manga_history (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  manga_id INT REFERENCES manga(id) ON DELETE CASCADE,
  action VARCHAR(32) NOT NULL, -- create, update, delete, add_chapter
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 