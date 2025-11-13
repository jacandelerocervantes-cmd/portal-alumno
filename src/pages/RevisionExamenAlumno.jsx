// src/pages/RevisionExamenAlumno.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaSpinner, FaArrowLeft, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './RevisionExamenAlumno.css'; // Crearemos este CSS

// Importar todos los players
import OpcionMultiplePlayer from '../components/examen/OpcionMultiplePlayer';
import AbiertaPlayer from '../components/examen/AbiertaPlayer';
import CrucigramaPlayer from '../components/examen/CrucigramaPlayer';
import SopaLetrasPlayer from '../components/examen/SopaLetrasPlayer';
import RelacionarColumnasPlayer from '../components/examen/RelacionarColumnasPlayer';

const RevisionExamenAlumno = () => {
    const { intentoId } = useParams();
    const navigate = useNavigate();

    // Estados
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [intento, setIntento] = useState(null); // Guardará la info del intento (ej. nota final)
    const [evaluacion, setEvaluacion] = useState(null); // Guardará la info de la evaluación (ej. JSON de juegos)
    const [revisionData, setRevisionData] = useState([]); // Array de preguntas/respuestas

    useEffect(() => {
        const fetchRevisionData = async () => {
            if (!intentoId) {
                navigate('/dashboard'); // Salir si no hay ID
                return;
            }
            setLoading(true);
            try {
                // 1. Obtener la info del intento Y la evaluación (para saber el tipo)
                const { data: intentoData, error: intentoError } = await supabase
                    .from('intentos_evaluacion')
                    .select('*, evaluacion:evaluaciones(*)')
                    .eq('id', intentoId)
                    .single();
                
                if (intentoError) throw new Error("No se pudo cargar el intento. Asegúrate de tener permiso.");
                
                // 2. Comprobar si la revisión está activa (doble chequeo, aunque la RPC ya lo hace)
                if (!intentoData.evaluacion.revision_activa) {
                    throw new Error("La revisión para este examen aún no ha sido activada por tu docente.");
                }
                
                setIntento(intentoData);
                setEvaluacion(intentoData.evaluacion);

                // 3. Llamar a la RPC segura para obtener los datos de revisión
                const { data: rpcData, error: rpcError } = await supabase
                    .rpc('get_examen_revision_data', { p_intento_id: intentoId });

                if (rpcError) throw new Error("Error al obtener los datos de revisión.");

                // 4. Manejar los datos
                const esTipoJuego = ['crucigrama', 'sopa_letras', 'relacionar_columnas'].includes(intentoData.evaluacion.tipo_evaluacion);

                if (esTipoJuego) {
                    // Si es un juego, la RPC no devuelve mucho. Usamos el JSON de la evaluación
                    // y la respuesta guardada (que también está en la RPC)
                    const respuestaJuego = rpcData.find(r => r.pregunta_id === null || r.pregunta_id === intentoData.evaluacion.id);
                    setRevisionData([{
                        pregunta_id: intentoData.evaluacion.id,
                        pregunta_texto: intentoData.evaluacion.titulo,
                        tipo_pregunta: intentoData.evaluacion.tipo_evaluacion,
                        datos_extra: intentoData.evaluacion.preguntas_json,
                        puntos: 100, // Asumimos 100
                        respuesta_alumno: respuestaJuego?.respuesta_alumno || {},
                        respuesta_correcta: { ...intentoData.evaluacion.preguntas_json }, // Las "entradas" son la respuesta
                        puntos_obtenidos: intentoData.calificacion_final
                    }]);
                } else {
                    // Si es estándar, usamos los datos de la RPC
                    setRevisionData(rpcData);
                }

            } catch (err) {
                console.error("Error cargando revisión:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRevisionData();
    }, [intentoId, navigate]);

    // Renderiza el Player adecuado en "modo revisión"
    const renderRevisionPlayer = (pregunta) => {
        const props = {
            pregunta: pregunta,
            respuestaActual: pregunta.respuesta_alumno, // Lo que el alumno respondió
            respuestaCorrecta: pregunta.respuesta_correcta, // La respuesta correcta
            puntosObtenidos: pregunta.puntos_obtenidos,
            mode: 'revision' // ¡La prop clave!
        };

        switch (pregunta.tipo_pregunta) {
            case 'opcion_multiple':
                return <OpcionMultiplePlayer {...props} />;
            case 'abierta':
                return <AbiertaPlayer {...props} />;
            case 'crucigrama':
                return <CrucigramaPlayer {...props} />;
            case 'sopa_letras':
                return <SopaLetrasPlayer {...props} />;
            case 'relacionar_columnas':
                return <RelacionarColumnasPlayer {...props} />;
            default:
                return <p>Tipo de pregunta no soportado: {pregunta.tipo_pregunta}</p>;
        }
    };

    if (loading) {
        return <div className="examen-loading"><FaSpinner className="spinner" /> Cargando Revisión...</div>;
    }

    if (error) {
        return (
            <div className="examen-error">
                <FaExclamationTriangle />
                <p>{error}</p>
                <button className="btn-secondary" onClick={() => navigate(-1)}>Volver</button>
            </div>
        );
    }

    return (
        <div className="revision-examen-container">
            <header className="revision-header">
                <button onClick={() => navigate(`/materia/${evaluacion?.materia_id}?tab=evaluaciones`)} className="back-button">
                    <FaArrowLeft /> Volver a Evaluaciones
                </button>
                <h2>Revisión: {evaluacion?.titulo}</h2>
                <div className="calificacion-final-badge">
                    Calificación Final:
                    <strong>{intento?.calificacion_final.toFixed(0)} / 100</strong>
                </div>
            </header>

            <main className="revision-preguntas-list">
                {revisionData.map((pregunta, index) => (
                    <div key={pregunta.pregunta_id || index} className="revision-pregunta-wrapper card">
                        <div className="pregunta-header">
                            <h4>Pregunta {index + 1}</h4>
                            <div className={`pregunta-resultado ${pregunta.puntos_obtenidos > 0 ? 'correcta' : 'incorrecta'}`}>
                                {pregunta.puntos_obtenidos > 0 ? <FaCheck /> : <FaTimes />}
                                {pregunta.puntos_obtenidos} / {pregunta.puntos} pts
                            </div>
                        </div>
                        {renderRevisionPlayer(pregunta)}
                    </div>
                ))}
            </main>
        </div>
    );
};

export default RevisionExamenAlumno;