CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

CREATE TABLE IF NOT EXISTS task (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO task (title) VALUES
  ('Realizar proyecto'),
  ('Hacer commits'),
  ('Configurar CI/CD');
