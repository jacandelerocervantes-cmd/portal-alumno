// src/pages/AlumnoPortal.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// --- 1. Importar FaChartPie para el reporte y eliminar FaGraduationCap ---
import { FaSpinner, FaArrowLeft, FaBook, FaClipboardList, FaFileAlt, FaChartPie } from 'react-icons/fa'; // FaGraduationCap no se usa
import './AlumnoPortal.css'; 

// --- 1. Importar los componentes de las pestañas ---
import AlumnoActividades from '../components/alumno/AlumnoActividades'; // <-- AÑADIR ESTE
import AlumnoEvaluaciones from '../components/alumno/AlumnoEvaluaciones'; // <-- AÑADIR ESTE
import AlumnoMaterial from '../components/alumno/AlumnoMaterial'; // <-- AÑADIR ESTE
import AlumnoReporte from '../components/alumno/AlumnoReporte'; // <-- 2. Importar el nuevo componente en lugar de AlumnoCalificaciones

const AlumnoPortal = () => {
    // ... (estados: materia, loading, error, activeTab... sin cambios)
    const { id: materiaId } = useParams();
    const navigate = useNavigate();
    const [materia, setMateria] = useState(null);
    const [loading, setLoading] = useState(true); // Iniciar en true para mostrar spinner
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('actividades'); 

    // ... (useEffect de fetchMateria... sin cambios)
    useEffect(() => {
        const fetchMateria = async () => {
            if (!materiaId) {
                setError("No se proporcionó un ID de materia.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                // RLS: "Alumnos pueden ver sus materias inscritas" nos protege
                const { data, error: materiaError } = await supabase
                    .from('materias')
                    .select('*') 
                    .eq('id', materiaId)
                    .single();

                if (materiaError) throw materiaError;
                setMateria(data);
            } catch (err) {
                console.error("Error cargando la materia:", err.message);
                setError("No se pudo cargar la información de la materia.");
            } finally {
                setLoading(false);
            }
        };

        fetchMateria();
    }, [materiaId]);


    const renderTabContent = () => {
        // --- 2. Conectar el componente real ---
        switch (activeTab) {
            case 'actividades':
                return <AlumnoActividades materiaId={materia.id} />;
            case 'evaluaciones':
                return <AlumnoEvaluaciones materiaId={materia.id} />; // <-- CONECTADO
            case 'material':
                return <AlumnoMaterial materia={materia} />; // <-- CONECTADO
            case 'reporte': // <-- 3. Cambiar 'calificaciones' por 'reporte' y renderizar el nuevo componente
                return <AlumnoReporte materiaId={materia.id} />;
            default:
                return null;
        }
    };

    // ... (el resto del JSX: loading, error, return... sin cambios)
    if (loading) {
        return (
            <div className="portal-loading">
                <FaSpinner className="spinner" />
                <p>Cargando materia...</p>
            </div>
        );
    }

    if (error) {
        return <div className="portal-error error-message">{error}</div>;
    }

    if (!materia) {
        return <div className="portal-error error-message">Materia no encontrada.</div>;
    }

    return (
        <div className="alumno-portal-container">
            <div className="portal-header">
                <button onClick={() => navigate('/dashboard')} className="back-button">
                    <FaArrowLeft /> Mis Materias
                </button>
                <h2>{materia.nombre}</h2>
                <span className="semestre-tag">{materia.semestre}</span>
            </div>

            {/* --- 5. Pestañas Modificadas --- */}
            <div className="portal-tabs">
                <button 
                    className={`tab-button ${activeTab === 'actividades' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('actividades')}>
                    <FaClipboardList /> Actividades
                </button>
                <button 
                    className={`tab-button ${activeTab === 'evaluaciones' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('evaluaciones')}>
                    <FaFileAlt /> Evaluaciones
                </button>
                <button 
                    className={`tab-button ${activeTab === 'material' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('material')}>
                    <FaBook /> Material
                </button>
                {/* --- CAMBIO DE NOMBRE E ICONO --- */}
                <button 
                    className={`tab-button ${activeTab === 'reporte' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('reporte')}>
                    <FaChartPie /> Reporte
                </button>
            </div>

            {/* --- Contenido de la Pestaña --- */}
            <div className="portal-tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AlumnoPortal;