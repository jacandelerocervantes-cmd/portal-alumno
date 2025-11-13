// src/pages/AlumnoPortal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate de tener tu supabaseClient en este proyecto
import { supabase } from '../supabaseClient'; 
import './AlumnoPortal.css';
 
const AlumnoPortal = () => {
    // const [matricula, setMatricula] = useState(''); // Ya no se usa para el login
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState(''); // Nuevo estado para la contraseña
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // ¡ESTE ES EL CAMBIO!
            // Usamos el login de Supabase Auth.
            // El 'email' es el correo del alumno.
            // El 'password' es la matrícula del alumno (según tu función crear-usuario-alumno)
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: correo,
                password: password, 
            });

            if (signInError) throw signInError;

            // ¡Éxito! La sesión se maneja automáticamente.
            // Redirigimos al dashboard de evaluaciones.
            navigate('/alumno/evaluaciones');

        } catch (err) {
            console.error("Error en login alumno:", err);
            if (err.message.includes("Invalid login credentials")) {
                setError('Correo o contraseña (matrícula) incorrectos.');
            } else {
                setError(err.message || 'Error al iniciar sesión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container"> {/* Reutilizando clases de Auth.css si existe */}
            <div className="auth-card card"> {/* Reutilizando clases de Auth.css si existe */}
                <h2 className="auth-title">Portal del Alumno</h2> {/* Reutilizando clases de Auth.css si existe */}
                <p className="auth-subtitle">Ingresa con tu correo y contraseña (tu matrícula).</p> {/* Reutilizando clases de Auth.css si existe */}
                {error && <p style={{ color: 'red', fontSize: '0.9em' }}>{error}</p>}
                
                <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                     <div className="form-group">
                        <label htmlFor="correo">Correo Institucional</label>
                        <input
                            id="correo" type="email" value={correo}
                            onChange={(e) => setCorreo(e.target.value)} required
                            style={{padding: '10px', fontSize: '1rem'}}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña (es tu Matrícula)</label>
                        <input
                            id="password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)} required
                            style={{padding: '10px', fontSize: '1rem'}}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{marginTop: '10px'}}>
                        {loading ? 'Validando...' : 'Acceder'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AlumnoPortal;