// src/pages/AlumnoDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AlumnoMateriaCard from '../components/AlumnoMateriaCard';
import './AlumnoDashboard.css'; // Crearemos este CSS
import { FaSpinner } from 'react-icons/fa';

const AlumnoDashboard = () => {
  const [materia, setMateria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMateria = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Obtener el usuario autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("No se pudo encontrar el usuario.");

        // 2. Buscar el registro del alumno usando el user_id
        //    RLS ("Alumnos pueden ver su propio registro") nos protege aquí.
        const { data: alumnoData, error: alumnoError } = await supabase
          .from('alumnos')
          .select('materia_id')
          .eq('user_id', user.id)
          .single(); // Asumimos que un usuario es un solo alumno

        if (alumnoError) throw new Error("No se pudo encontrar tu registro de alumno.");
        if (!alumnoData || !alumnoData.materia_id) {
          throw new Error("No estás inscrito en ninguna materia.");
        }

        // 3. Buscar la materia usando la materia_id del alumno
        //    RLS ("Alumnos pueden ver sus materias inscritas") nos protege aquí.
        const { data: materiaData, error: materiaError } = await supabase
          .from('materias')
          .select('*')
          .eq('id', alumnoData.materia_id)
          .single(); // Es una sola materia

        if (materiaError) throw materiaError;

        setMateria(materiaData);
      } catch (err) {
        console.error("Error cargando el dashboard:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMateria();
  }, []);

  return (
    <div className="alumno-dashboard-container">
      <h2>Mis Materias</h2>

      {loading && (
        <div className="dashboard-loading">
          <FaSpinner className="spinner" />
          <p>Cargando tu información...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>Por favor, contacta a tu profesor si crees que esto es un error.</p>
        </div>
      )}

      {!loading && !error && materia && (
        <div className="materia-list">
          <AlumnoMateriaCard materia={materia} />
        </div>
      )}
    </div>
  );
};

export default AlumnoDashboard;