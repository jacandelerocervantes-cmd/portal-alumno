import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// import Layout from './components/Layout'; // Copia Layout, Header, Footer de la app docente
import AlumnoPortal from './pages/AlumnoPortal';
import AlumnoDashboard from './pages/AlumnoDashboard';
import ExamenAlumno from './pages/ExamenAlumno';
import RevisionExamenAlumno from './pages/RevisionExamenAlumno';
import { supabase } from './supabaseClient';

// Guardia de Ruta Protegida (revisa la sesión real de Supabase)
const AlumnoProtectedRoute = ({ session, loading }) => {
    if (loading) return <div>Verificando acceso...</div>;
    // Si hay sesión, muestra el contenido (Outlet). Si no, redirige al login.
    return session ? <Outlet /> : <Navigate to="/alumno/portal" replace />;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    });

    // 2. Escuchar cambios de sesión (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      {/* <Layout session={session}>  El Layout mostrará la UserBar si hay sesión */}
        <Routes>
          
          {/* Rutas Protegidas de Alumno */}
          <Route element={<AlumnoProtectedRoute session={session} loading={loading} />}>
            <Route path="/alumno/evaluaciones" element={<AlumnoDashboard />} />
            <Route path="/alumno/examen/:evaluacionId" element={<ExamenAlumno />} />
            <Route path="/alumno/revision/:intentoId" element={<RevisionExamenAlumno />} />
          </Route>

          {/* Ruta de Login Alumno */}
          <Route
            path="/alumno/portal"
            element={
              loading ? <div>Cargando...</div> :
              session ? <Navigate to="/alumno/evaluaciones" replace /> : // Si ya hay sesión, ir a dashboard
              <AlumnoPortal />
            }
          />

          {/* Ruta Raíz (redirige al login si no hay sesión) */}
          <Route
            path="/"
            element={
              loading ? <div>Cargando...</div> :
              session ? <Navigate to="/alumno/evaluaciones" replace /> :
              <Navigate to="/alumno/portal" replace />
            }
          />
          
          {/* Ruta comodín (404) */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      {/* </Layout> */}
    </Router>
  );
}

export default App
