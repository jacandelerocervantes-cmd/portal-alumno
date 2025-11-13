import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaSpinner, FaExclamationTriangle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

// Importar todos los players de examen
import CrucigramaPlayer from '../components/examen/CrucigramaPlayer';
import SopaLetrasPlayer from '../components/examen/SopaLetrasPlayer';
import RelacionarColumnasPlayer from '../components/examen/RelacionarColumnasPlayer';
import AbiertaPlayer from '../components/examen/AbiertaPlayer'; // <-- 1. IMPORTAR

import './ExamenAlumno.css';

const ExamenAlumno = () => {
    const { id: evaluacionId } = useParams();
    const navigate = useNavigate();

    // Estados de datos
    const [evaluacion, setEvaluacion] = useState(null);
    const [preguntas, setPreguntas] = useState([]);
    const [intento, setIntento] = useState(null);
    const [alumnoId, setAlumnoId] = useState(null);

    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [terminando, setTerminando] = useState(false);
    
    // Hook para obtener el ID del alumno (necesario para crear el intento)
    useEffect(() => {
        const getAlumnoId = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuario no autenticado.");

                const { data: alumnoData, error: alumnoError } = await supabase
                    .from('alumnos')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();
                
                if (alumnoError || !alumnoData) throw new Error("Registro de alumno no encontrado.");
                setAlumnoId(alumnoData.id);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        getAlumnoId();
    }, []);

    // --- useEffect principal (Modificado) ---
    useEffect(() => {
        if (!evaluacionId || !alumnoId) return;

        const loadExamenData = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Cargar datos de la evaluación
                // RLS: "Alumnos pueden ver evaluaciones de sus materias"
                const { data: evalData, error: evalError } = await supabase
                    .from('evaluaciones')
                    .select('*')
                    .eq('id', evaluacionId)
                    .single();

                if (evalError) throw evalError;
                setEvaluacion(evalData);

                // 2. Cargar las preguntas de la evaluación (¡Forma Segura!)
                const { data: preguntasData, error: preguntasError } = await supabase
                    .rpc('get_preguntas_evaluacion', {
                        p_evaluacion_id: evaluacionId
                    });
                
                if (preguntasError) throw preguntasError;

                if (!preguntasData || preguntasData.length === 0) {
                     // Si la RPC no devuelve nada, usamos el JSON de respaldo (para crucigrama, etc.)
                    console.warn("RPC no devolvió preguntas, usando JSON de la evaluación.");
                    if (evalData.preguntas_json) {
                        setPreguntas(evalData.preguntas_json);
                    } else {
                        throw new Error("No se pueden cargar las preguntas del examen.");
                    }
                } else {
                    setPreguntas(preguntasData);
                }


                // 3. Buscar o crear el intento
                // RLS: "Alumnos pueden ver/crear sus propios intentos"
                
                // Buscar un intento en progreso
                const { data: intentoEnProgreso, error: busquedaError } = await supabase
                    .from('intentos_evaluacion')
                    .select('*')
                    .eq('evaluacion_id', evaluacionId)
                    .eq('alumno_id', alumnoId)
                    .eq('estado', 'en_progreso')
                    .maybeSingle();

                if (busquedaError) throw busquedaError;

                if (intentoEnProgreso) {
                    // El alumno está continuando un examen
                    setIntento(intentoEnProgreso);
                } else {
                    // Crear un nuevo intento
                    const { data: nuevoIntento, error: creacionError } = await supabase
                        .from('intentos_evaluacion')
                        .insert({
                            evaluacion_id: evaluacionId,
                            alumno_id: alumnoId,
                            estado: 'en_progreso',
                            calificacion_final: 0 // Default
                        })
                        .select()
                        .single();
                    if (creacionError) throw creacionError;
                    setIntento(nuevoIntento);
                }

            } catch (err) {
                console.error("Error cargando el examen:", err.message);
                setError("Error al cargar el examen: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        loadExamenData();
    }, [evaluacionId, alumnoId]);


    // Función para renderizar el "player" correcto
    const renderExamenPlayer = () => {
        if (!evaluacion || !intento || preguntas.length === 0) {
            return <div>Cargando datos del examen...</div>;
        }

        const playerProps = {
            evaluacion: evaluacion,
            preguntas: preguntas,
            intentoId: intento.id,
            onGuardarRespuesta: (preguntaId, respuesta) => {
                // Lógica para guardar respuesta en 'respuestas_alumno'
                console.log(`Guardando... P:${preguntaId}, R:`, respuesta);
                // (La implementaremos después)
            }
        };

        switch (evaluacion.tipo_evaluacion) {
            case 'crucigrama':
                return <CrucigramaPlayer {...playerProps} />;
            case 'sopa_letras':
                return <SopaLetrasPlayer {...playerProps} />;
            case 'relacionar_columnas':
                return <RelacionarColumnasPlayer {...playerProps} />;
            case 'abierta': // <-- 2. AÑADIR CASE
                return <AbiertaPlayer {...playerProps} />;
            default:
                return <p>Tipo de examen no soportado: {evaluacion.tipo_evaluacion}</p>;
        }
    };

    // Función para finalizar el examen
    const handleTerminarExamen = async () => {
        if (!window.confirm("¿Estás seguro de que deseas terminar y entregar este examen? Una vez entregado, no podrás cambiar tus respuestas.")) {
            return;
        }

        setTerminando(true);
        setError('');
        try {
            // 1. Revisar si el examen tiene preguntas abiertas
            const tienePreguntasAbiertas = preguntas.some(p => p.tipo_pregunta === 'abierta');
            
            let estadoFinal = 'entregado'; // Estado por defecto

            if (tienePreguntasAbiertas) {
                // ¡IMPORTANTE! Si hay preguntas abiertas, marcamos para revisión manual
                estadoFinal = 'pendiente_revision'; 
            }

            // 2. Actualizar el estado del intento
            const { error: updateError } = await supabase
                .from('intentos_evaluacion')
                .update({ 
                    estado: estadoFinal, 
                    fecha_entrega: new Date().toISOString() 
                })
                .eq('id', intento.id);
            
            if (updateError) throw updateError;

            // 3. (Lógica condicional) SOLO llamar a la calificación automática
            //    si NO hay preguntas abiertas.
            if (!tienePreguntasAbiertas) {
                const { error: invokeError } = await supabase.functions.invoke('procesar-cola-evaluacion', {
                    body: { intento_id: intento.id }
                });

                if (invokeError) {
                    console.error("Error al encolar calificación automática:", invokeError.message);
                }
            } else {
                console.log("Examen enviado a revisión manual.");
            }
            
            // 4. Redirigir al alumno
            navigate(`/materia/${evaluacion.materia_id}?tab=evaluaciones`);
            
        } catch (err) {
            console.error("Error al terminar el examen:", err.message);
            setError("Error al entregar: " + err.message);
        } finally {
            setTerminando(false);
        }
    };

    // ... (JSX de loading y error sin cambios)
    if (loading) {
        return <div className="examen-loading"><FaSpinner className="spinner" /> Cargando Examen...</div>;
    }

    if (error) {
        return <div className="examen-error"><FaExclamationTriangle /> <p>{error}</p></div>;
    }

    return (
        <div className="examen-alumno-container">
            <div className="examen-header">
                <h2>{evaluacion?.titulo}</h2>
                <button
                    className="btn-danger"
                    onClick={handleTerminarExamen}
                    disabled={terminando}
                >
                    {terminando ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
                    Terminar y Entregar
                </button>
            </div>
            
            <main className="examen-player-area">
                {renderExamenPlayer()}
            </main>
        </div>
    );
};

export default ExamenAlumno;