import { useState, useEffect } from 'react';
import axios from 'axios';

export const CategoriesPage = ({ completed, navigateTo, setSelectedRoute }: any) => {
  const [paths, setPaths] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Traemos las rutas y los cursos para calcular el progreso real
        const [resPaths, resCourses] = await Promise.all([
          axios.get('http://localhost:3001/api/paths'),
          axios.get('http://localhost:3001/api/courses')
        ]);
        setPaths(resPaths.data);
        setCourses(resCourses.data);
      } catch (err) {
        console.error("Error cargando rutas de la base de datos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container-center" style={{ marginTop: '100px', textAlign: 'center' }}>
        <div className="white-text">Cargando tus rutas personalizadas...</div>
      </div>
    );
  }

  return (
    <div className="container-center" style={{ marginTop: '40px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="white-text">Rutas de Especialización</h1>
        <p style={{ color: '#94a3b8' }}>
          Explora las carreras diseñadas desde el panel de administración.
        </p>
      </header>

      <main style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px' 
      }}>
        {paths.map((route) => {
          // 1. Obtenemos el total de videos de la ruta (dato que viene del Backend)
          const totalInRoute = Number(route.video_count) || 0;

          // 2. Calculamos cuántos de esos videos ha completado el usuario
          // Filtramos los cursos generales buscando cuáles coinciden con los IDs de esta ruta
          const doneInRoute = courses.filter((c: any) => 
            completed.includes(c.id) && 
            route.video_ids?.includes(c.id)
          ).length;

          // 3. Calculamos el porcentaje de progreso
          const progress = totalInRoute > 0 ? Math.round((doneInRoute / totalInRoute) * 100) : 0;

          return (
            <div 
              key={route.id}
              onClick={() => {
                setSelectedRoute(route); 
                navigateTo('path-detail', route);
              }}
              className="route-card-premium"
              style={{
                background: '#1e293b',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #334155',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
            >
              {/* Badge decorativo con el color de la ruta */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: route.color || '#4ade80',
                boxShadow: `0 0 10px ${route.color || '#4ade80'}`
              }} />

              {/* Imagen de la ruta */}
              <div style={{ 
                height: '140px', 
                background: route.image 
                  ? `url(${route.image}) center/cover` 
                  : `linear-gradient(135deg, #0f172a 0%, ${route.color}44 100%)`,
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {!route.image && <span style={{ fontSize: '3rem' }}>🛤️</span>}
              </div>
              
              <div style={{ padding: '20px' }}>
                <h4 className="white-text" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {route.title}
                </h4>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '0.8rem', 
                  margin: '10px 0 20px 0',
                  lineHeight: '1.4',
                  minHeight: '40px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {route.description || 'Sin descripción disponible.'}
                </p>
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.75rem', 
                    color: route.color || '#4ade80', 
                    marginBottom: '6px',
                    fontWeight: 'bold'
                  }}>
                    <span>{totalInRoute} Videos</span>
                    <span>{progress}% Completado</span>
                  </div>
                  <div style={{ height: '6px', background: '#0f172a', borderRadius: '10px' }}>
                    <div style={{ 
                      width: `${progress}%`, 
                      height: '100%', 
                      background: route.color || '#4ade80', 
                      borderRadius: '10px', 
                      boxShadow: `0 0 10px ${route.color || '#4ade80'}66`,
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {paths.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <h3>No hay rutas creadas</h3>
          <p>Crea tu primera ruta desde el panel de administrador para verla aquí.</p>
        </div>
      )}
    </div>
  );
};