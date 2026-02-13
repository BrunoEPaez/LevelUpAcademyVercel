const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const setup = async () => {
  try {
    console.log("⏳ Limpiando tablas antiguas...");
    await pool.query('DROP TABLE IF EXISTS lessons CASCADE');
    await pool.query('DROP TABLE IF EXISTS courses CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    console.log("⏳ Creando tabla de usuarios...");
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("⏳ Creando tabla de cursos...");
    await pool.query(`
      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        youtube_id VARCHAR(50),
        category VARCHAR(100),
        instructor VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("⏳ Creando tabla de lecciones...");
    await pool.query(`
      CREATE TABLE lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255),
        youtube_id VARCHAR(50),
        position INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ ¡Todo listo! Tablas creadas con éxito.");
    process.exit();
  } catch (err) {
    console.error("❌ Error fatal creando la base de datos:", err);
    process.exit(1);
  }
};

setup();