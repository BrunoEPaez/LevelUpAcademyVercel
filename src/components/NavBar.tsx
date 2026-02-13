import React from 'react';

export const NavBar = ({ navigateTo, token, handleLogout, userName }: any) => (
  <nav className="main-nav" style={{ background: '#1a1a2e', borderBottom: '2px solid #4ade80', position: 'sticky', top: 0, zIndex: 100 }}>
    <div className="container-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
      
      {/* LOGO */}
      <div onClick={() => navigateTo('landing')} style={{ cursor: 'pointer' }}>
        <span className="brand-logo" style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.5rem' }}>
          LevelUp<span style={{color: '#a855f7'}}>Academy</span>
        </span>
      </div>

      {/* LINKS Y USUARIO */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        
        {/* Saludo al Alumno (Solo si hay token y nombre) */}
        {token && userName && (
          <div style={{ marginRight: '15px', paddingRight: '15px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#fff', fontSize: '0.9rem', opacity: 0.9 }}>
              Hola, <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{userName}</span>
            </span>
          </div>
        )}

        <button className="btn-text" style={{color: '#fff', background: 'none', border: 'none', cursor: 'pointer'}} onClick={() => navigateTo('explorer')}>
          Explorar
        </button>
        
        <button className="btn-text" style={{color: '#fff', background: 'none', border: 'none', cursor: 'pointer'}} onClick={() => navigateTo('categories')}>
          Rutas
        </button>
        
        {token && (
          <>
            <button 
              className="btn-text" 
              style={{color: '#a855f7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}} 
              onClick={() => navigateTo('dashboard')}
            >
              Mi Progreso
            </button>
            
            <button 
              className="btn-text" 
              style={{color: '#4ade80', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}} 
              onClick={() => navigateTo('profile')}
            >
              Mi Cuenta
            </button>

            {/* BOTÓN ADMIN - Visible para todos los registrados en esta Demo */}
            <button 
              className="btn-text" 
              style={{
                color: '#22d3ee', // Un color cian para diferenciarlo
                background: 'rgba(34, 211, 238, 0.1)', 
                padding: '5px 10px', 
                borderRadius: '5px',
                border: '1px solid #22d3ee', 
                cursor: 'pointer', 
                fontWeight: 'bold'
              }} 
              onClick={() => navigateTo('admin')}
            >
              Admin 🛠️
            </button>
          </>
        )}

        {token ? (
          <button className="btn-primary-levelup" style={{ marginLeft: '10px' }} onClick={handleLogout}>
            Salir
          </button>
        ) : (
          <button className="btn-primary-levelup" style={{ marginLeft: '10px' }} onClick={() => navigateTo('login')}>
            Comenzar
          </button>
        )}
      </div>
    </div>
  </nav>
);