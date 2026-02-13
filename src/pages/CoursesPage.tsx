import React, { useEffect, useState } from 'react';
import { CourseCard } from '../components/CourseCard';

// 1. Definimos la interfaz para que TypeScript no de error al recibir props de App.tsx
interface CoursesPageProps {
  courses?: any[];           // El ? significa que es opcional
  favorites: number[];
  toggleFavorite: (e: React.MouseEvent, course: any) => void;
  navigateTo: (view: string) => void;
  setSelectedCourse: (course: any) => void;
}

// 2. Aplicamos la interfaz al componente
export const CoursesPage: React.FC<CoursesPageProps> = ({ 
  courses: initialCourses, 
  favorites, 
  toggleFavorite, 
  navigateTo, 
  setSelectedCourse 
}) => {
  const [courses, setCourses] = useState<any[]>(initialCourses || []);
  const [loading, setLoading] = useState(!initialCourses || initialCourses.length === 0);

  useEffect(() => {
    // Solo hace el fetch si no vienen cursos desde las props
    if (!initialCourses || initialCourses.length === 0) {
      fetch('http://localhost:3001/api/courses')
        .then((res) => res.json())
        .then((data) => {
          setCourses(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error conectando con el backend:", err);
          setLoading(false);
        });
    }
  }, [initialCourses]);

  if (loading) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>
        <div className="loader"></div> {/* Si tienes un loader en CSS */}
        <p>Cargando cursos...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '40px 20px' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
        Explorar Cursos
      </h1>
      
      {/* EXPLICACIÓN DEL ARREGLO:
          - 'grid-auto-rows: 1fr' obliga a todas las filas a tener la misma altura.
          - 'align-items: stretch' obliga a las tarjetas a estirarse a lo ancho y alto del grid.
      */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px',
        maxWidth: '1400px',
        margin: '0 auto',
        alignItems: 'stretch' 
      }}>
        {courses.map((course: any) => (
          <div key={course.id} style={{ display: 'flex' }}> {/* Wrapper para asegurar el ancho */}
            <CourseCard 
              course={course} 
              onClick={() => {
                setSelectedCourse(course);
                navigateTo('course-detail');
              }}
              onFavorite={(e) => toggleFavorite(e, course)}
              isFavorite={favorites.includes(course.id)}
            />
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '50px' }}>
          No se encontraron cursos disponibles.
        </div>
      )}
    </div>
  );
};