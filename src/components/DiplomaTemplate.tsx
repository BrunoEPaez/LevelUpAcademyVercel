import React from 'react';

interface DiplomaProps {
  userName: string;
  courseTitle: string;
  date: string;
  id: string;
}

export const DiplomaTemplate = React.forwardRef<HTMLDivElement, DiplomaProps>(({ userName, courseTitle, date, id }, ref) => {
  return (
    <div 
      ref={ref}
      style={{
        width: '800px',
        height: '600px',
        padding: '40px',
        background: 'white',
        border: '20px solid #1e293b',
        position: 'absolute',
        left: '-9999px', // Lo mantenemos fuera de la vista
        fontFamily: 'serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#1e293b'
      }}
    >
      <div style={{ border: '2px solid #fbbf24', width: '100%', height: '100%', padding: '40px' }}>
        <h1 style={{ fontSize: '50px', margin: 0, color: '#fbbf24' }}>👑 LEVELUP ACADEMY</h1>
        <p style={{ fontSize: '20px', letterSpacing: '5px' }}>CERTIFICADO DE EXCELENCIA</p>
        
        <div style={{ margin: '40px 0' }}>
          <p style={{ fontSize: '18px', fontStyle: 'italic' }}>Este documento certifica que</p>
          <h2 style={{ fontSize: '40px', margin: '10px 0', borderBottom: '2px solid #1e293b', display: 'inline-block', padding: '0 50px' }}>
            {userName || "Estudiante Destacado"}
          </h2>
        </div>

        <p style={{ fontSize: '18px' }}>Ha completado satisfactoriamente el curso de:</p>
        <h3 style={{ fontSize: '30px', color: '#4ade80' }}>{courseTitle}</h3>

        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', width: '80%' }}>
          <div>
            <p style={{ margin: 0 }}><b>Fecha:</b> {date}</p>
            <p style={{ fontSize: '12px' }}>ID Verificación: {id}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '150px', borderBottom: '1px solid black' }}></div>
            <p style={{ fontSize: '14px' }}>Firma del Instructor</p>
          </div>
        </div>
      </div>
    </div>
  );
});