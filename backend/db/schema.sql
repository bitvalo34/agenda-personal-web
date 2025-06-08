-- Usuarios (único usuario que usará la app)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

-- Contactos
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_landline VARCHAR(20),
  phone_mobile VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  notes TEXT
);

-- Etiquetas (Cliente, Proveedor)
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Relación muchos a muchos entre contactos y etiquetas
CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY(contact_id, tag_id),
  FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
