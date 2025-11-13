// src/components/alumno/AlumnoEvaluaciones.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import AlumnoEvaluacionCard from '../AlumnoEvaluacionCard';
import { FaSpinner } from 'react-icons/fa';

const AlumnoEvaluaciones = ({ materiaId }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [intentos, setIntentos] = useState(new Map()); // Map para búsqueda rápida
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
        
        if (alumnoError || !alumnoData) throw new Error("No se pudo encontrar tu registro de alumno.");
        setAlumnoId(alumnoData.id);

        // 2. Obtener todas las evaluaciones de la materia
        // RLS: "Alumnos pueden ver evaluaciones de sus materias"
        const { data: evaluacionesData, error: evaluacionesError } = await supabase
          .from('evaluaciones')
          .select('*')
          .eq('materia_id', materiaId)
          .order('unidad', { ascending: true });

        if (evaluacionesError) throw evaluacionesError;
        setEvaluaciones(evaluacionesData || []);

        // 3. Obtener TODOS los intentos de este alumno para esta materia
        // RLS: "Alumnos pueden ver sus propios intentos"
        const { data: intentosData, error: intentosError } = await supabase
          .from('intentos_evaluacion')
          .select('*') // Traemos todo (id, estado, calificacion_final, etc.)
          .eq('alumno_id', alumnoData.id);
          // No filtramos por materia_id aquí, ya que el alumno_id es suficiente
          // y la RLS ya nos protege.

        if (intentosError) throw intentosError;

        // Convertir el array de intentos en un Map por 'evaluacion_id'
        const intentosMap = new Map();
        if (intentosData) {
          intentosData.forEach(intento => {
            // Si hay múltiples intentos, esto guardará el último (idealmente)
            // TODO: Mejorar esto si se permiten múltiples intentos
            intentosMap.set(intento.evaluacion_id, intento);
          });
        }
        setIntentos(intentosMap);

      } catch (err) {
        console.error("Error cargando evaluaciones:", err.message);
        setError("Error al cargar las evaluaciones: " + err.message);
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
        <p>Cargando evaluaciones...</p>
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="alumno-evaluaciones-container">
      {evaluaciones.length === 0 ? (
        <p>Tu profesor aún no ha publicado ninguna evaluación.</p>
      ) : (
        <div className="evaluaciones-list">
          {evaluaciones.map(ev => (
            <AlumnoEvaluacionCard 
              key={ev.id} 
              evaluacion={ev}
              intento={intentos.get(ev.id)} // Pasamos el intento (o undefined)
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumnoEvaluaciones;