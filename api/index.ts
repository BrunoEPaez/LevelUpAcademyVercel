import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Configuración de la base de datos
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

app.use(cors());
app.use(express.json());

// --- TIPADOS ---
interface AuthRequest extends Request {
  user?: any;
}

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Token faltante" });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// ==========================================
// 1. AUTENTICACIÓN
// ==========================================

app.post('/api/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body.user;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password]
    );
    const token = jwt.sign({ user_id: result.rows[0].id }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ user: result.rows[0], token });
  } catch (err: any) {
    console.error("Error en registro:", err);
    res.status(422).json({ errors: ["El email ya existe o datos inválidos"] });
  }
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body.user;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET || 'secret');
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (err: any) {
    console.error("Error en login:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. PERFIL DE USUARIO
// ==========================================

app.get('/api/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.user_id]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  const u = req.body.user;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, city=$2, phone=$3, bio=$4, linkedin_url=$5, github_url=$6, avatar_base64=$7 
       WHERE id=$8 RETURNING *`,
      [u.name, u.city, u.phone, u.bio, u.linkedin_url, u.github_url, u.avatar_base64, req.user.user_id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CURSOS Y RUTAS (PÚBLICO)
// ==========================================

// NUEVA RUTA: Obtener un solo curso por ID
app.get('/api/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// 1. Ejecuta esto en tu base de datos (PostgreSQL):
// ALTER TABLE path_courses ADD COLUMN position INT DEFAULT 0;

// 2. Actualiza el GET /api/paths para que devuelva los videos ordenados:
app.get('/api/paths', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
      (SELECT COUNT(*) FROM path_courses pc WHERE pc.path_id = p.id) as video_count,
      (
        SELECT array_agg(course_id ORDER BY position ASC) 
        FROM path_courses pc 
        WHERE pc.path_id = p.id
      ) as video_ids
      FROM paths p 
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Endpoint para guardar el nuevo orden:
app.post('/api/paths/:id/reorder', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { videoIds } = req.body; // Un array ordenado de IDs: [5, 2, 8...]
  try {
    await pool.query('BEGIN');
    for (let i = 0; i < videoIds.length; i++) {
      await pool.query(
        'UPDATE path_courses SET position = $1 WHERE path_id = $2 AND course_id = $3',
        [i, id, videoIds[i]]
      );
    }
    await pool.query('COMMIT');
    res.json({ message: "Orden actualizado" });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// OBTENER VIDEOS DE UNA RUTA ESPECÍFICA (Crucial para PathDetailPage)
app.get('/api/paths/:id/courses', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT c.* FROM courses c 
     JOIN path_courses pc ON c.id = pc.course_id 
     WHERE pc.path_id = $1 
     ORDER BY pc.position ASC`, // IMPORTANTE
    [id]
  );
  res.json(result.rows);
});

// ==========================================
// 4. PROGRESO Y FAVORITOS
// ==========================================

app.get('/api/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM user_courses WHERE user_id = $1', [req.user.user_id]);
    res.json({
      favoriteIds: result.rows.filter(r => r.favorite).map(r => r.course_id),
      completedCourseIds: result.rows.filter(r => r.completed).map(r => r.course_id)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { course_id, action_type } = req.body;
  const col = action_type === 'favorite' ? 'favorite' : 'completed';
  try {
    await pool.query(`
      INSERT INTO user_courses (user_id, course_id, ${col}) VALUES ($1, $2, true)
      ON CONFLICT (user_id, course_id) DO UPDATE SET ${col} = NOT user_courses.${col}`,
      [req.user.user_id, course_id]);
    res.json({ status: 'success' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PANEL ADMINISTRADOR (PROTEGIDO)
// ==========================================

app.post('/api/admin/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { title, description, thumbnail_url, youtube_id, instructor } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO courses (title, description, thumbnail_url, youtube_id, instructor) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, thumbnail_url, youtube_id, instructor]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/courses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, youtube_id, thumbnail_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE courses SET title=$1, description=$2, youtube_id=$3, thumbnail_url=$4
       WHERE id=$5 RETURNING *`,
      [title, description, youtube_id, thumbnail_url, id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/courses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM path_courses WHERE course_id = $1', [id]);
    await pool.query('DELETE FROM user_courses WHERE course_id = $1', [id]);
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ message: "Curso eliminado con éxito" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GESTIÓN DE RUTAS
app.post('/api/admin/paths', authenticateToken, async (req: AuthRequest, res: Response) => {
  // Intentamos sacar los datos directo o desde req.body.path
  const data = req.body.path || req.body; 
  const { title, description, color } = data;

  try {
    const result = await pool.query(
      'INSERT INTO paths (title, description, color) VALUES ($1, $2, $3) RETURNING *',
      [title, description, color || '#4ade80']
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error("Error detallado en POST paths:", err.message); // Mira esto en los logs
    res.status(500).json({ error: err.message });
  }
});

// VINCULAR VIDEOS (Muchos a Muchos)
app.post('/api/paths/:id/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { videoIds } = req.body; // Se asume que vienen en el orden deseado
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM path_courses WHERE path_id = $1', [id]);
    
    if (videoIds && videoIds.length > 0) {
      for (let i = 0; i < videoIds.length; i++) {
        // Guardamos el video con su posición (i)
        await pool.query(
          'INSERT INTO path_courses (path_id, course_id, position) VALUES ($1, $2, $3)', 
          [id, videoIds[i], i]
        );
      }
    }
    await pool.query('COMMIT');
    res.json({ message: "Videos ordenados y guardados" });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/paths/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, color } = req.body;
  try {
    const result = await pool.query(
      'UPDATE paths SET title=$1, description=$2, color=$3 WHERE id=$4 RETURNING *',
      [title, description, color, id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/paths/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM path_courses WHERE path_id = $1', [id]);
    await pool.query('DELETE FROM paths WHERE id = $1', [id]);
    res.json({ message: "Ruta eliminada con éxito" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. ASISTENTE IA Y OTROS
// ==========================================

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message } = req.body;
  try {
    const responseIA = `[Mistral AI]: Analizando tu duda sobre "${message}"...`;
    res.json({ response: responseIA });
  } catch (err: any) {
    res.status(500).json({ error: "Error en Mistral AI" });
  }
});

// Agregar esto en index.ts
app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// MANEJO DE ERRORES DE PUERTO

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 LevelUp Academy API activa en puerto ${PORT}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} está ocupado. Intenta cerrar otros procesos.`);
    process.exit(1);
  } else {
    console.error("❌ Error al iniciar el servidor:", err);
  }
});


// ✅ AGREGA ESTO:
export default app;