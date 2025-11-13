// src/components/alumno/AlumnoCalificaciones.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { FaSpinner, FaCheckCircle, FaClock, FaEdit } from 'react-icons/fa';
import './AlumnoCalificaciones.css'; // Crearemos este CSS

const AlumnoCalificaciones = ({ materiaId }) => {
  const [itemsCalificados, setItemsCalificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCalificaciones = async () => {
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
        
        const alumnoId = alumnoData.id;

        // 2. Obtener calificaciones de ACTIVIDADES
        const { data: actsData, error: actsError } = await supabase
          .from('calificaciones')
          .select(`
            calificacion_obtenida,
            estado,
            actividades ( nombre, unidad )
          `)
          .eq('alumno_id', alumnoId)
          .eq('materia_id', materiaId)
          .not('actividad_id', 'is', null);
          
        if (actsError) throw actsError;

        // 3. Obtener calificaciones de EVALUACIONES
        const { data: evalsData, error: evalsError } = await supabase
          .from('intentos_evaluacion')
          .select(`
            calificacion_final,
            estado,
            evaluaciones ( nombre, unidad )
          `)
          .eq('alumno_id', alumnoId)
          .eq('evaluaciones.materia_id', materiaId); // Join implícito
          
        if (evalsError) throw evalsError;

        // 4. Mapear y unificar los datos
        const actividades = actsData.map(item => ({
          nombre: item.actividades.nombre,
          tipo: 'Actividad',
          unidad: item.actividades.unidad,
          estado: item.estado,
          calificacion: item.calificacion_obtenida
        }));

        const evaluaciones = evalsData.map(item => ({
          nombre: item.evaluaciones.nombre,
          tipo: 'Evaluación',
          unidad: item.evaluaciones.unidad,
          estado: item.estado,
          calificacion: item.calificacion_final
        }));

        // 5. Combinar y ordenar
        const todosLosItems = [...actividades, ...evaluaciones];
        todosLosItems.sort((a, b) => a.unidad - b.unidad || a.nombre.localeCompare(b.nombre));
        
        setItemsCalificados(todosLosItems);

      } catch (err) {
        console.error("Error cargando calificaciones:", err.message);
        setError("Error al cargar tus calificaciones: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCalificaciones();
  }, [materiaId]);

  // Renderizar la calificación y el estado
  const renderCalificacion = (item) => {
    switch (item.estado) {
      case 'calificado':
        return <span className="cal-numero">{item.calificacion.toFixed(0)}</span>;
      
      case 'pendiente_revision':
        // ¡Tu lógica del asterisco!
        // Muestra la calif. automática (que puede ser 0) con un *
        return (
          <span className="cal-numero pendiente">
            {item.calificacion.toFixed(0)}*
            <span className="tooltip">*Pendiente de revisión manual</span>
          </span>
        );
      
      case 'entregado':
        return <span className="cal-texto cal-entregado"><FaClock /> Entregado</span>;
      
      default:
        return <span className="cal-texto cal-pendiente">Pendiente</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <FaSpinner className="spinner" />
        <p>Cargando calificaciones...</p>
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="alumno-calificaciones-container">
      {itemsCalificados.length === 0 ? (
        <p>Aún no hay actividades ni evaluaciones calificadas.</p>
      ) : (
        <div className="table-responsive">
          <table className="calificaciones-table">
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Elemento</th>
                <th>Tipo</th>
                <th>Calificación</th>
              </tr>
            </thead>
            <tbody>
              {itemsCalificados.map((item, index) => (
                <tr key={index}>
                  <td className="col-unidad">{item.unidad}</td>
                  <td className="col-nombre">{item.nombre}</td>
                  <td>{item.tipo}</td>
                  <td className="col-calificacion">
                    {renderCalificacion(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="nota-asterisco">
            * Calificación parcial. Pendiente de la revisión final del docente.
          </p>
        </div>
      )}
    </div>
  );
};

export default AlumnoCalificaciones;