// src/components/examen/OpcionMultiplePlayer.jsx
import React, { useState, useEffect } from 'react';
import './OpcionMultiplePlayer.css'; // Crearemos este CSS

const OpcionMultiplePlayer = ({ pregunta, respuestaActual, onRespuestaChange }) => {
    const { id: preguntaId, pregunta: texto_pregunta, opciones } = pregunta;

    // El estado 'seleccion' guarda el *índice* de la opción elegida.
    // Lo inicializamos desde 'respuestaActual' (que es { seleccion: index })
    const [seleccion, setSeleccion] = useState(respuestaActual?.seleccion ?? null);

    // Sincronizar si la respuesta se carga tarde (aunque useEffect en el anfitrión ya lo maneja)
    useEffect(() => {
        setSeleccion(respuestaActual?.seleccion ?? null);
    }, [respuestaActual]);

    const handleSelectOption = (index) => {
        setSeleccion(index); // Actualizar estado local
        
        // --- LLAMAR AL ANFITRIÓN PARA GUARDAR ---
        // Guardamos el JSON { seleccion: index }
        // El hook 'useGuardarRespuesta' en el anfitrión se encargará del debounce.
        onRespuestaChange(preguntaId, { seleccion: index });
    };

    return (
        <div className="opcion-multiple-player">
            <h3 className="pregunta-texto">{texto_pregunta}</h3>
            
            <div className="opciones-container">
                {opciones && opciones.map((opcion, index) => (
                    <button
                        key={index}
                        className={`opcion-item ${seleccion === index ? 'selected' : ''}`}
                        onClick={() => handleSelectOption(index)}
                    >
                        {/* 'opcion.texto' viene del JSON de la tabla 'preguntas' */}
                        {opcion.texto}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OpcionMultiplePlayer;