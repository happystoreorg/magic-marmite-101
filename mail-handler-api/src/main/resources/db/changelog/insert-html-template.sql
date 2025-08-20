CREATE TABLE IF NOT EXISTS html_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  html_content TEXT NOT NULL
);

INSERT INTO html_templates (id, name, html_content) VALUES
  (id, 'dailyMailHandler', '<html></html>');

CREATE TABLE IF NOT EXISTS USERS (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO USERS (email, username) VALUES
  ('arnoldfotsing@yahoo.fr', 'Arnold Yahoo');
