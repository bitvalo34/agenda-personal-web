-- Usuarios de prueba
INSERT INTO users (email, password_hash)
  VALUES ('admin@tudominio.com',
          '$2b$10$PG8aHiYriZB8MTOcQjFGDOOfwXI2JYM/Suva1OS.sbrTETnJSNSna')
  ON DUPLICATE KEY UPDATE email=email;

-- Etiquetas
INSERT INTO tags (id, name) VALUES
  (1, 'Cliente'),
  (2, 'Proveedor')
ON DUPLICATE KEY UPDATE name = VALUES(name);
