import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './AuthAlumno.css'; 

const AuthAlumno = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // La contraseña inicial es la matrícula
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usamos el login estándar de Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Si el login es exitoso, Supabase guarda la sesión
      // y redirigimos al dashboard del alumno
      navigate('/dashboard');

    } catch (error) {
      console.error("Error en inicio de sesión:", error.message);
      if (error.message.includes("Invalid login credentials")) {
        setError("Correo o matrícula incorrectos.");
      } else {
        setError("Error al iniciar sesión: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-alumno-container">
      <div className="auth-alumno-card">
        <h2>Portal de Alumno</h2>
        <p>Inicia sesión con tu correo institucional y tu matrícula como contraseña.</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Correo Institucional</label>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@instituto.edu.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña (Matrícula)</label>
            <input
              id="password"
              type="password"
              placeholder="Tu matrícula"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthAlumno;