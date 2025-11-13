// src/components/alumno/AlumnoReporte.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaSpinner } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './AlumnoReporte.css';

// Componente pequeño para las "tarjetas" de KPIs (reutilizado de ReportesPanel)
const KpiCard = ({ title, value, unit, risk = false }) => (
  <div className={`report-kpi-card ${risk ? 'risk' : ''}`}>
    <h4>{title}</h4>
    <span className="kpi-value">
      {value}
      <span className="kpi-unit">{unit}</span>
    </span>
  </div>
);

// Componente de Gráfica simple (reutilizado)
const SimpleBarChart = ({ data, dataKey, name }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Bar dataKey="grade" fill="var(--color-primary)" name={name} />
    </BarChart>
  </ResponsiveContainer>
);

const AlumnoReporte = ({ materiaId }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Obtener el ID del alumno (necesitamos el 'id', no el 'user_id')
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado.");

        const { data: alumnoData, error: alumnoError } = await supabase
          .from('alumnos')
          .select('id')
          .eq('user_id', user.id)
          .eq('materia_id', materiaId)
          .single();
        
        if (alumnoError || !alumnoData) throw new Error("No se pudo encontrar tu registro de alumno.");

        // 2. Llamar a la RPC 'get_student_holistic_report'
        // (Esta RPC ya es segura y solo devuelve los datos del alumno)
        const { data, error: invokeError } = await supabase.functions.invoke('get-student-holistic-report', {
          body: { alumno_id: alumnoData.id, materia_id: materiaId }
        });

        if (invokeError) throw invokeError;
        setReportData(data);
      } catch (err) {
        console.error("Error cargando el reporte:", err.message);
        setError("Error al cargar tu reporte: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [materiaId]);

  // Preparar datos para la gráfica de asistencia
  const attendancePieData = [
      { name: 'Asistencias', value: reportData?.attendance.attended_sessions || 0 },
      { name: 'Faltas', value: (reportData?.attendance.total_sessions || 0) - (reportData?.attendance.attended_sessions || 0) }
  ];
  const COLORS = ['var(--color-primary)', '#E0E0E0'];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <FaSpinner className="spinner" />
        <p>Generando tu reporte...</p>
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="alumno-reporte-container">
      {reportData && (
        <>
          {/* --- KPIs --- */}
          <div className="report-kpi-grid">
            <KpiCard
              title="Asistencia"
              value={reportData.attendance.percentage}
              unit="%"
              risk={reportData.attendance.percentage < 80}
            />
            <KpiCard
              title="Prom. Actividades"
              value={reportData.activities.average}
              unit="pts"
            />
            <KpiCard
              title="Prom. Evaluaciones"
              value={reportData.evaluations.average}
              unit="pts"
            />
          </div>

          {/* --- Gráficas --- */}
          <div className="report-charts-grid">
            {/* Gráfica de Asistencia */}
            <div className="report-chart-container card">
              <h5>Asistencia ({reportData.attendance.attended_sessions} de {reportData.attendance.total_sessions})</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfica de Actividades */}
            <div className="report-chart-container card">
              <h5>Calificaciones de Actividades</h5>
              {reportData.activities.list.length > 0 ? (
                <SimpleBarChart data={reportData.activities.list} dataKey="grade" name="Calificación" />
              ) : <p className="no-data">Sin actividades calificadas.</p>}
            </div>

            {/* Gráfica de Evaluaciones */}
            <div className="report-chart-container card">
              <h5>Calificaciones de Evaluaciones</h5>
              {reportData.evaluations.list.length > 0 ? (
                <SimpleBarChart data={reportData.evaluations.list} dataKey="grade" name="Calificación" />
              ) : <p className="no-data">Sin evaluaciones calificadas.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AlumnoReporte;