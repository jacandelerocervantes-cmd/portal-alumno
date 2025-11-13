// src/components/examen/AbiertaPlayer.jsx
import React, { useState, useEffect } from 'react';
import './AbiertaPlayer.css'; // Crearemos este CSS

const AbiertaPlayer = ({ pregunta, respuestaActual, onRespuestaChange }) => {
    const { id: preguntaId, pregunta: texto_pregunta } = pregunta;

    // El estado 'texto' guarda la respuesta del textarea.
    // Lo inicializamos desde 'respuestaActual' (que es { texto: "..." })
    const [texto, setTexto] = useState(respuestaActual?.texto ?? '');

    // Sincronizar si la respuesta se carga tarde
    useEffect(() => {
        setTexto(respuestaActual?.texto ?? '');
    }, [respuestaActual]);

    const handleChange = (e) => {
        const nuevoTexto = e.target.value;
        setTexto(nuevoTexto); // Actualizar estado local

        // --- LLAMAR AL ANFITRIÓN PARA GUARDAR ---
        // Guardamos el JSON { texto: "..." }
        // El anfitrión se encarga del debounce y de guardarlo.
        onRespuestaChange(preguntaId, { texto: nuevoTexto });
    };

    return (
        <div className="abierta-player">
            <h3 className="pregunta-texto">{texto_pregunta}</h3>
            
            <div className="respuesta-container">
                <textarea
                    className="respuesta-textarea"
                    placeholder="Escribe tu respuesta aquí..."
                    value={texto}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default AbiertaPlayer;