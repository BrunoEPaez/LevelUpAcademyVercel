import React from 'react';

interface CourseCardProps {
  course: any;
  onClick: () => void;
  onFavorite: (e: any, course: any) => void;
  isFavorite: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onFavorite, isFavorite }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: '#1e293b',
        borderRadius: '15px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #334155',
        transition: 'transform 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Imagen usando thumbnail_url del JSON */}
      <img 
        src={course.thumbnail_url} 
        alt={course.title}
        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
      />

      <div style={{ padding: '20px' }}>
        <h3 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 10px 0', height: '2.4em', overflow: 'hidden' }}>
          {course.title}
        </h3>
        
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
          {course.description.substring(0, 80)}...
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#2dd4bf', fontWeight: 'bold' }}>GRATIS</span>
          <button 
  onClick={(e) => onFavorite(e, course)}
  style={{ 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    fontSize: '1.5rem',
    color: isFavorite ? '#ef4444' : '#64748b', // Rojo si es favorito, gris si no
    transition: 'transform 0.2s'
  }}
>
  {isFavorite ? '❤️' : '✓'} {/* Cambiamos el '✓' por un corazón vacío */}
</button>
        </div>
      </div>
    </div>
  );
};