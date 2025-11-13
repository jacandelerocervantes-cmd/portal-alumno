// src/components/alumno/AlumnoActividades.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AlumnoActividadCard from './AlumnoActividadCard';
import { FaSpinner } from 'react-icons/fa';

const AlumnoActividades = ({ materiaId }) => {
  const [actividades, setActividades] = useState([]);
  const [calificaciones, setCalificaciones] = useState(new Map()); // Usamos un Map para búsqueda rápida
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alumnoId, setAlumnoId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Obtener el ID del alumno
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const { data: alumnoData, error: alumnoError } = await supabase
          .from('alumnos')
          .select('id')
          .eq('user_id', user.id)
          .eq('materia_id', materiaId)
          .single();
        
        if (alumnoError || !alumnoData) throw new Error("No se pudo encontrar tu registro de alumno para esta materia.");
        setAlumnoId(alumnoData.id);

        // 2. Obtener todas las actividades de la materia
        // RLS: "Alumnos pueden ver actividades de sus materias"
        const { data: actividadesData, error: actividadesError } = await supabase
          .from('actividades')
          .select('*')
          .eq('materia_id', materiaId)
          .order('unidad', { ascending: true })
          .order('fecha_limite', { ascending: true });

        if (actividadesError) throw actividadesError;
        setActividades(actividadesData || []);

        // 3. Obtener TODAS las calificaciones de este alumno para esta materia
        // RLS: "Alumnos pueden ver sus propias calificaciones"
        const { data: calificacionesData, error: calificacionesError } = await supabase
          .from('calificaciones')
          .select('actividad_id, calificacion_obtenida, estado')
          .eq('alumno_id', alumnoData.id)
          .eq('materia_id', materiaId)
          .not('actividad_id', 'is', null); // Solo las que son de actividades

        if (calificacionesError) throw calificacionesError;

        // Convertir el array de calificaciones en un Map para fácil acceso
        const calificacionesMap = new Map();
        if (calificacionesData) {
          calificacionesData.forEach(cal => {
            calificacionesMap.set(cal.actividad_id, cal);
          });
        }
        setCalificaciones(calificacionesMap);

      } catch (err) {
        console.error("Error cargando actividades:", err.message);
        setError("Error al cargar las actividades: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [materiaId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <FaSpinner className="spinner" />
        <p>Cargando actividades...</p>
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="alumno-actividades-container">
      {actividades.length === 0 ? (
        <p>Tu profesor aún no ha publicado ninguna actividad.</p>
      ) : (
        <div className="actividades-list">
          {actividades.map(act => (
            <AlumnoActividadCard 
              key={act.id} 
              actividad={act}
              calificacion={calificaciones.get(act.id)} // Pasamos la calificación (o undefined)
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumnoActividades;