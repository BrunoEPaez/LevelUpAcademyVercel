import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (userData: any) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validamos que las contraseñas coincidan antes de enviar
    if (formData.password !== formData.password_confirmation) {
      alert("Las contraseñas no coinciden");
      return;
    }
    // Llamamos a la función que viene de App.tsx
    onRegister(formData);
  };

  return (
    <div className="container-center" style={{ padding: '80px 0' }}>
      <div className="job-detail-card" style={{ maxWidth: '400px', margin: '0 auto', background: '#1e293b', padding: '40px', borderRadius: '20px' }}>
        <h2 className="white-text" style={{ marginBottom: '20px' }}>Crear Cuenta</h2>
        
        <form onSubmit={handleSubmit}>
          <input 
            className="input-custom" // Asegúrate de tener este estilo o usa style
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
            type="text" 
            placeholder="Nombre completo" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
            type="email" 
            placeholder="Correo electrónico" 
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
            type="password" 
            placeholder="Contraseña" 
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <input 
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
            type="password" 
            placeholder="Confirmar Contraseña" 
            required
            value={formData.password_confirmation}
            onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
          />
          
          <button type="submit" className="btn-primary-levelup" style={{ width: '100%', marginBottom: '15px' }}>
            Registrarse
          </button>
        </form>

        <p style={{ color: '#94a3b8' }}>
          ¿Ya tienes cuenta? {' '}
          <span 
            onClick={onSwitchToLogin} 
            style={{ color: '#4ade80', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
};