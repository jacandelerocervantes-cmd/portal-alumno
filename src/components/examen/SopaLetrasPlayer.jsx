// src/components/examen/SopaLetrasPlayer.jsx
import React, { useState, useEffect } from 'react';
import './SopaLetrasPlayer.css'; // Asegúrate de que el CSS exista

// --- Lógica de generación (Placeholder - igual que en tu archivo) ---
// En una implementación real, esto vendría del JSON o se generaría
// con un algoritmo más complejo.
const generarCuadriculaSopa = (palabras, tamano = 12) => {
    const grid = Array.from({ length: tamano }, () => 
        Array.from({ length: tamano }, () => 
            String.fromCharCode(65 + Math.floor(Math.random() * 26)) // Llenar con letras aleatorias
        )
    );
    
    // --- Algoritmo de inserción de palabras (muy simplificado) ---
    // Esto es solo para el ejemplo, ya que el layout real
    // vendría del JSON de la pregunta (pregunta.datos_extra.cuadricula)
    let filaActual = 0;
    for (const palabra of palabras) {
        if (filaActual < tamano && palabra.length <= tamano) {
            for (let i = 0; i < palabra.length; i++) {
                grid[filaActual][i] = palabra[i].toUpperCase();
            }
            filaActual++;
        }
    }
    return grid;
};



// --- COMPONENTE MODIFICADO ---
const SopaLetrasPlayer = ({ 
    pregunta, 
    respuestaActual, 
    onRespuestaChange,
    mode = 'examen' 
}) => {
    // 'pregunta.datos_extra' contiene { palabras: [], cuadricula: [...] }
    const { datos_extra, pregunta: texto_pregunta } = pregunta;
    const { palabras = [], cuadricula: cuadriculaGenerada = [] } = datos_extra || {};

    // Estado de la cuadrícula
    const [cuadricula, setCuadricula] = useState([]);
    // Estado de la selección actual del usuario (ej. ['0-1', '0-2', '0-3'])
    const [seleccion, setSeleccion] = useState([]); 
    // Estado de las palabras ya encontradas
    const [palabrasEncontradas, setPalabrasEncontradas] = useState(respuestaActual?.palabras || []);

    // Cargar cuadrícula y respuestas guardadas
    useEffect(() => {
        // La cuadrícula DEBE venir de los datos_extra
        if (cuadriculaGenerada && cuadriculaGenerada.length > 0) {
            setCuadricula(cuadriculaGenerada);
        } else {
            // Fallback por si acaso (no debería usarse en producción)
            setCuadricula(generarCuadriculaSopa(palabras));
        }

        // Cargar palabras ya encontradas
        if (respuestaActual?.palabras) {
            setPalabrasEncontradas(respuestaActual.palabras);
        }
    }, [datos_extra, respuestaActual]); // Depende de las props


    // Lógica para manejar el clic en una celda
    const handleCeldaClick = (fila, col) => {
        // --- 1. Deshabilitar en modo revisión ---
        if (mode === 'revision') return;
        
        const key = `${fila}-${col}`;
        const indexEnSeleccion = seleccion.indexOf(key);

        let nuevaSeleccion = [...seleccion];
        if (indexEnSeleccion > -1) {
            // Si ya está seleccionada, la quita (permite deseleccionar)
            nuevaSeleccion.splice(indexEnSeleccion, 1);
        } else {
            // Si no, la añade
            nuevaSeleccion.push(key);
        }
        setSeleccion(nuevaSeleccion);
        
        // Comprobar si la nueva selección forma una palabra
        comprobarPalabra(nuevaSeleccion);
    };

    // Comprobar si la selección actual es una palabra válida
    const comprobarPalabra = (seleccionActual) => {
        // 1. Convertir selección (ej. ['0-1', '0-2']) a un string de letras (ej. "HOLA")
        const palabraFormada = seleccionActual
            .map(key => {
                const [fila, col] = key.split('-');
                return cuadricula[fila][col];
            })
            .join('');

        // 2. Comprobar si la palabra formada (o su reverso) está en la lista
        const palabraInversa = palabraFormada.split('').reverse().join('');
        
        const palabraMatch = palabras.find(p => 
            p.toUpperCase() === palabraFormada || p.toUpperCase() === palabraInversa
        );

        if (palabraMatch && !palabrasEncontradas.includes(palabraMatch)) {
            // ¡Palabra encontrada!
            const nuevasEncontradas = [...palabrasEncontradas, palabraMatch];
            setPalabrasEncontradas(nuevasEncontradas);
            
            // Limpiar selección actual
            setSeleccion([]);

            // --- LLAMAR AL ANFITRIÓN PARA GUARDAR ---
            // Guardamos la nueva lista de palabras encontradas
            onRespuestaChange(pregunta.id, { palabras: nuevasEncontradas });
        }
    };

    // Helper para saber si una celda está seleccionada o encontrada
    const getCeldaClase = (fila, col) => {
        const key = `${fila}-${col}`;
        if (seleccion.includes(key)) {
            return 'seleccionada';
        }
        // (Lógica más avanzada podría colorear permanentemente las palabras encontradas)
        return '';
    };

    // Renderizado
    return (
        <div className="sopa-letras-player">
            <p className="instrucciones-pregunta">{texto_pregunta}</p>
            <div className="sopa-letras-area">
                {/* Lista de Palabras a buscar */}
                <div className="sopa-palabras-lista">
                    <h4>Palabras a encontrar:</h4>
                    <ul>
                        {palabras.map((palabra, index) => {
                            // --- 2. Lógica de Revisión ---
                            const encontrada = palabrasEncontradas.includes(palabra);
                            let clase = '';
                            if (mode === 'revision') {
                                clase = encontrada ? 'encontrada' : 'no-encontrada';
                            } else {
                                clase = encontrada ? 'encontrada' : '';
                            }

                            return (
                                <li key={index} className={clase}>
                                    {palabra}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Cuadrícula de la Sopa */}
                <div className="sopa-letras-cuadricula" style={{ gridTemplateColumns: `repeat(${cuadricula[0]?.length || 1}, 1fr)` }}>
                    {cuadricula.map((filaArr, filaIndex) =>
                        filaArr.map((letra, colIndex) => (
                            <div 
                                key={`${filaIndex}-${colIndex}`}
                                className={`sopa-letras-celda ${getCeldaClase(filaIndex, colIndex)}`}
                                onClick={() => handleCeldaClick(filaIndex, colIndex)}
                                style={{ cursor: mode === 'revision' ? 'default' : 'pointer' }} // <-- 3. Cambiar cursor
                            >
                                {letra}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SopaLetrasPlayer;