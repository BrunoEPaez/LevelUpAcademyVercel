import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (credentials: any) => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Solo pasamos el objeto plano, handleLogin en App.tsx se encarga de envolverlo en { user: ... }
  onLogin({ email, password }); 
};

  return (
    <div className="container-center" style={{ padding: '80px 0' }}>
      <div className="job-detail-card" style={{ maxWidth: '400px', margin: '0 auto', background: '#1e293b', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="white-text" style={{ fontSize: '2rem', marginBottom: '10px' }}>Bienvenido</h2>
          <p style={{ color: '#94a3b8' }}>Ingresa a tu panel de estudiante</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#e2e8f0', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email</label>
            <input 
              type="email" 
              className="nav-search-input" 
              style={{ width: '100%', padding: '12px' }} 
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ color: '#e2e8f0', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Contraseña</label>
            <input 
              type="password" 
              className="nav-search-input" 
              style={{ width: '100%', padding: '12px' }} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary-levelup" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            Iniciar Sesión
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <p className="white-text" style={{ fontSize: '0.9rem' }}>
            ¿Eres nuevo aquí? <span 
              onClick={onSwitchToRegister} 
              style={{ color: 'var(--accent-green)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Crea tu cuenta gratis
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};