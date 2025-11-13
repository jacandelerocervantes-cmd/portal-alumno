// src/components/examen/RelacionarColumnasPlayer.jsx
import React, { useState, useEffect } from 'react';
// --- 1. Importar FaCheck y FaTimes ---
import { FaArrowRight, FaTimes, FaCheck } from 'react-icons/fa';
import './RelacionarColumnasPlayer.css';

// --- COMPONENTE MODIFICADO ---
const RelacionarColumnasPlayer = ({ 
    pregunta, 
    respuestaActual, 
    onRespuestaChange,
    mode = 'examen',
    respuestaCorrecta,
    puntosObtenidos
}) => {
    // 'datos_extra' tiene { columnaA: [], columnaB: [] }
    const { datos_extra, pregunta: texto_pregunta } = pregunta;
    const { columnaA = [], columnaB = [] } = datos_extra || {};

    // Estado para guardar los pares. E.g: { 0: 2 } (indexA: indexB)
    const [pares, setPares] = useState(respuestaActual?.pares || {});
    // Estado para la selección activa de la Columna A
    const [seleccionA, setSeleccionA] = useState(null); // Guarda el { item, index }

    // Cargar las respuestas guardadas cuando el componente se monta
    useEffect(() => {
        if (respuestaActual?.pares) {
            setPares(respuestaActual.pares);
        }
    }, [respuestaActual]);

    // Manejar clic en Columna A
    const handleSelectColA = (itemA, indexA) => {
        // Si está en revisión o ya está emparejado, no hacer nada (debe borrar primero)
        if (mode === 'revision' || pares[indexA] !== undefined) return;
        
        // Si hace clic en el ya seleccionado, lo deselecciona
        if (seleccionA && seleccionA.index === indexA) {
            setSeleccionA(null);
        } else {
            setSeleccionA({ item: itemA, index: indexA });
        }
    };

    // Manejar clic en Columna B
    const handleSelectColB = (itemB, indexB) => {
        // Si está en revisión o no hay nada seleccionado en A, no hacer nada
        if (mode === 'revision' || !seleccionA) return;

        // Si el itemB ya está en un par, no permitir (evita pares duplicados en B)
        const bYaUsado = Object.values(pares).includes(indexB);
        if (bYaUsado) return;

        // Crear el nuevo par
        const nuevosPares = {
            ...pares,
            [seleccionA.index]: indexB // E.g: { 0: 2 }
        };

        // Actualizar estado local y limpiar selección
        setPares(nuevosPares);
        setSeleccionA(null);

        // --- LLAMAR AL ANFITRIÓN PARA GUARDAR ---
        onRespuestaChange(pregunta.id, { pares: nuevosPares });
    };

    // Quitar un par
    const handleClearPair = (indexA) => {
        if (mode === 'revision') return;

        const nuevosPares = { ...pares };
        delete nuevosPares[indexA]; // Elimina la llave (e.g., '0')

        setPares(nuevosPares);
        
        // --- LLAMAR AL ANFITRIÓN PARA GUARDAR ---
        onRespuestaChange(pregunta.id, { pares: nuevosPares });
    };

    // Helper para obtener el índice B emparejado con A
    const getParIndexB = (indexA) => pares[indexA];
    
    // Helper para saber si un B está usado
    const isBUsado = (indexB) => Object.values(pares).includes(indexB);

    return (
        <div className="relacionar-columnas-player">
            <p className="instrucciones-pregunta">{texto_pregunta}</p>
            
            <div className="columnas-area">
                {/* --- Columna A --- */}
                <div className="columna-relacionar">
                    <h4>Columna A</h4>
                    {columnaA.map((itemA, indexA) => {
                        const estaSeleccionado = seleccionA?.index === indexA;
                        const parIndexB = getParIndexB(indexA);
                        const estaEmparejado = parIndexB !== undefined;

                        // --- 2. Lógica de Revisión ---
                        let esCorrecto = false;
                        if (mode === 'revision' && respuestaCorrecta?.pares) {
                            esCorrecto = (parIndexB === respuestaCorrecta.pares[indexA]);
                        }

                        return (
                            <div 
                                key={indexA} 
                                className={`
                                    col-item 
                                    ${estaSeleccionado ? 'selected' : ''} 
                                    ${estaEmparejado ? 'paired' : ''}
                                    ${mode === 'revision' ? 'disabled' : ''}
                                    ${mode === 'revision' && esCorrecto ? 'par-correcto' : ''}
                                    ${mode === 'revision' && !esCorrecto ? 'par-incorrecto' : ''}
                                `}
                                onClick={() => handleSelectColA(itemA, indexA)}
                            >
                                {itemA}
                                {estaEmparejado && mode === 'examen' && (
                                    <button 
                                        className="clear-pair-btn"
                                        onClick={(e) => { e.stopPropagation(); handleClearPair(indexA); }}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                                {/* --- 3. Icono de Revisión --- */}
                                {mode === 'revision' && (
                                    <span className="revision-icon">
                                        {esCorrecto ? <FaCheck /> : <FaTimes />}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- Área de Conexión (visual) --- */}
                <div className="columna-icono">
                    <FaArrowRight />
                </div>

                {/* --- Columna B --- */}
                <div className="columna-relacionar">
                    <h4>Columna B</h4>
                    {columnaB.map((itemB, indexB) => {
                        const estaEmparejado = isBUsado(indexB);
                        
                        return (
                            <div 
                                key={indexB} 
                                className={`
                                    col-item 
                                    ${estaEmparejado ? 'paired' : ''} 
                                    ${(seleccionA && !estaEmparejado) ? 'clickable' : ''}
                                    ${mode === 'revision' ? 'disabled' : ''}
                                `}
                                onClick={() => handleSelectColB(itemB, indexB)}
                            >
                                {itemB}
                            </div>
                        );
                    })}
                    
                </div>
            </div>

            
            {/* --- 4. Mostrar Respuesta Correcta (si falló) --- */}
            {mode === 'revision' && puntosObtenidos < (pregunta.puntos || 100) && (
                <div className="revision-correcta-container">
                    <h4>Respuestas Correctas:</h4>
                    <ul>
                        {columnaA.map((itemA, indexA) => (
                            <li key={indexA}>
                                <strong>{itemA}</strong> <FaArrowRight /> {columnaB[respuestaCorrecta.pares[indexA]]}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


export default RelacionarColumnasPlayer;