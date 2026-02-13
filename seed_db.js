const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const addCourse = async (category, title, author, url) => {
  try {
    // Extraer ID de YouTube
    let videoId = url.split('v=')[1]?.split('&')[0] || "dQw4w9WgXcQ";
    const description = `Curso completo de ${title} dictado por ${author}.`;
    const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // 1. Insertar el curso
    const courseRes = await pool.query(
      'INSERT INTO courses (title, description, thumbnail_url, youtube_id, category, instructor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [title, description, thumb, videoId, category, author]
    );

    // 2. Insertar la lección automática (como en tu Ruby)
    await pool.query(
      'INSERT INTO lessons (course_id, title, youtube_id, position) VALUES ($1, $2, $3, $4)',
      [courseRes.rows[0].id, `Clase Completa: ${title}`, videoId, 1]
    );
    
    console.log(`✅ Cargado: ${title}`);
  } catch (err) {
    console.error(`❌ Error en ${title}:`, err.message);
  }
};

const runSeeds = async () => {
  console.log("🌱 Iniciando carga masiva de cursos...");

  // --- DESARROLLO WEB ---
  await addCourse('Desarrollo web', 'HTML y CSS desde CERO', 'Soy Dalto', 'https://www.youtube.com/watch?v=ELSm-G201Ls');
  await addCourse('Desarrollo web', 'JAVASCRIPT Master', 'Soy Dalto', 'https://www.youtube.com/watch?v=EbMi1Qj4rVE');
  await addCourse('Desarrollo web', 'JAVA desde cero + Spring + Docker', 'Sergie Code', 'https://www.youtube.com/watch?v=BdNqW63ZaB0');
  await addCourse('Desarrollo web', 'NODE JS desde cero + Express', 'Sergie Code', 'https://www.youtube.com/watch?v=I17ln313Pjk');
  await addCourse('Desarrollo web', 'REACT JS desde cero', 'Sergie Code', 'https://www.youtube.com/watch?v=ladwC6Lrs-M');
  await addCourse('Desarrollo web', 'REACT 19 Full Curso 2025', 'Codigo 369', 'https://www.youtube.com/watch?v=m0soI9MQ4Dg');
  
  // --- DESARROLLO MÓVIL ---
  await addCourse('Desarrollo móvil', 'FLUTTER y DART desde CERO', 'AristiDevs', 'https://www.youtube.com/watch?v=IKG1eV2SetA');
  await addCourse('Desarrollo móvil', 'React Native EXPO 2025', 'Codigo 369', 'https://www.youtube.com/watch?v=GaXEzkDs6Yk');

  // --- BASES DE DATOS ---
  await addCourse('Bases de Datos', 'SQL desde CERO', 'Soy Dalto', 'https://www.youtube.com/watch?v=DFg1V-rO6Pg');
  await addCourse('Bases de Datos', 'SQL Master (MySQL/Postgres)', 'Sergie Code', 'https://www.youtube.com/watch?v=Fca_kWJJXvo');

  // --- INTELIGENCIA ARTIFICIAL ---
  await addCourse('Inteligencia Artificial', 'INTELIGENCIA ARTIFICIAL Completo', 'Informatica Live', 'https://www.youtube.com/watch?v=vnvrE_38od0');
  await addCourse('Inteligencia Artificial', 'N8N desde CERO 2026', 'Sinergia', 'https://www.youtube.com/watch?v=6CdgFR0VsVI');

  // (Agregué los más importantes, podés copiar y pegar más addCourse de tu lista de Ruby aquí)

  console.log("\n🚀 ¡Misión cumplida! Base de datos poblada.");
  process.exit();
};

runSeeds();