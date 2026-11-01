-- Yogish K J | PES1UG25AM819
CREATE DATABASE helpdesk;

\connect helpdesk

CREATE TABLE IF NOT EXISTS help_requests (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(50) NOT NULL,
  message VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  resolved BOOLEAN DEFAULT false
);

ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT false;
