// src/components/examen/AbiertaPlayer.jsx
import React, { useState, useEffect } from 'react';
import './AbiertaPlayer.css'; // Crearemos este CSS

const AbiertaPlayer = ({ 
    pregunta, 
    respuestaActual, 
    onRespuestaChange,
    mode = 'examen', // 'examen' o 'revision'
    respuestaCorrecta,
    puntosObtenidos 
}) => {
    const { id: preguntaId, pregunta: texto_pregunta } = pregunta;

    // El estado 'texto' guarda la respuesta del textarea.
    // Lo inicializamos desde 'respuestaActual' (que es { texto: "..." })
    const [texto, setTexto] = useState(respuestaActual?.texto ?? '');

    // Sincronizar si la respuesta se carga tarde
    useEffect(() => {
        setTexto(respuestaActual?.texto ?? '');
    }, [respuestaActual]);

    const handleChange = (e) => {
        // No permitir cambios en modo revisión
        if (mode === 'revision') return;

        const nuevoTexto = e.target.value;
        setTexto(nuevoTexto); // Actualizar estado local

        // --- LLAMAR AL ANFITRIÓN PARA GUARDAR ---
        // Guardamos el JSON { texto: "..." }
        // El anfitrión se encarga del debounce y de guardarlo.
        onRespuestaChange(preguntaId, { texto: nuevoTexto });
    };

    if (mode === 'revision') {
        return (
            <div className="abierta-player-revision">
                <h3 className="pregunta-texto">{texto_pregunta}</h3>
                
                {/* Respuesta del Alumno */}
                <div className="revision-respuesta-container">
                    <h4>Tu Respuesta</h4>
                    <div className="respuesta-texto review-box">
                        {respuestaActual?.texto || <em>(No respondiste)</em>}
                    </div>
                </div>

                {/* Respuesta Correcta (si el docente la proporcionó) */}
                {respuestaCorrecta?.texto && (
                    <div className="revision-respuesta-container">
                        <h4>Respuesta Esperada / Guía de Calificación</h4>
                        <div className="respuesta-texto review-box correcta">
                            {respuestaCorrecta.texto}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Modo Examen (normal)
    return (
        <div className="abierta-player">
            <h3 className="pregunta-texto">{texto_pregunta}</h3>
            
            <div className="respuesta-container">
                <textarea
                    className="respuesta-textarea"
                    placeholder="Escribe tu respuesta aquí..."
                    value={texto}
                    onChange={handleChange}
                    disabled={mode === 'revision'}
                />
            </div>
        </div>
    );
};

export default AbiertaPlayer;