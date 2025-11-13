import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate, Outlet } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AuthAlumno from './pages/AuthAlumno'
import AlumnoPortal from './pages/AlumnoPortal';
import AlumnoDashboard from './pages/AlumnoDashboard';
import ExamenAlumno from './pages/ExamenAlumno';
import Layout from './components/Layout'
import './App.css'

// Componente "guardián" para rutas privadas
const RutaProtegida = ({ session }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  // Si hay sesión, renderiza el Layout que contiene el Outlet
  return (
    <Layout session={session}>
      <Outlet />
    </Layout>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Intentar obtener la sesión activa al cargar la app
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    // 2. Escuchar cambios en la autenticación (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (_event === 'SIGNED_OUT') {
          navigate('/login');
        }
        if (_event === 'SIGNED_IN') {
          navigate('/dashboard');
        }
      }
    );

    // 3. Limpiar el listener al desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <div className="app-loading">Cargando...</div>; // O un spinner
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <AuthAlumno /> : <Navigate to="/dashboard" />} />
      
      {/* Rutas Privadas */}
      <Route element={<RutaProtegida session={session} />}>
        <Route path="/dashboard" element={<AlumnoDashboard />} />
        <Route path="/materia/:id" element={<AlumnoPortal />} />
        <Route path="/examen/:id" element={<ExamenAlumno />} />
        {/* <Route path="/examen/:id/revision" element={<RevisionExamenAlumno />} /> */}
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
    </Routes>
  )
}

export default App
