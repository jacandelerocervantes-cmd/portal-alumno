// src/components/examen/RelacionarColumnasPlayer.jsx
import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaTimes } from 'react-icons/fa';
import './RelacionarColumnasPlayer.css';

// --- COMPONENTE MODIFICADO ---
const RelacionarColumnasPlayer = ({ pregunta, respuestaActual, onRespuestaChange }) => {
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
        // Si ya está emparejado, no hacer nada (debe borrar primero)
        if (pares[indexA] !== undefined) return;
        
        // Si hace clic en el ya seleccionado, lo deselecciona
        if (seleccionA && seleccionA.index === indexA) {
            setSeleccionA(null);
        } else {
            setSeleccionA({ item: itemA, index: indexA });
        }
    };

    // Manejar clic en Columna B
    const handleSelectColB = (itemB, indexB) => {
        // Si no hay nada seleccionado en A, no hacer nada
        if (!seleccionA) return;

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
                        const estaEmparejado = getParIndexB(indexA) !== undefined;

                        return (
                            <div 
                                key={indexA} 
                                className={`col-item ${estaSeleccionado ? 'selected' : ''} ${estaEmparejado ? 'paired' : ''}`}
                                onClick={() => handleSelectColA(itemA, indexA)}
                            >
                                {itemA}
                                {estaEmparejado && (
                                    <button 
                                        className="clear-pair-btn"
                                        onClick={(e) => { e.stopPropagation(); handleClearPair(indexA); }}
                                    >
                                        <FaTimes />
                                    </button>
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
                                className={`col-item ${estaEmparejado ? 'paired' : ''} ${seleccionA ? 'clickable' : ''}`}
                                onClick={() => handleSelectColB(itemB, indexB)}
                            >
                                {itemB}
                            </div>
                        );
                    ))}
                </div>
            </div>
        </div>
    );
};


export default RelacionarColumnasPlayer;