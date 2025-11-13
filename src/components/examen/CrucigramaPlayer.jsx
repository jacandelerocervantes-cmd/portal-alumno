// src/components/examen/CrucigramaPlayer.jsx
import React, { useState, useEffect } from 'react';
import './CrucigramaPlayer.css';

// --- Lógica de generación de cuadrícula (MUY SIMPLIFICADA) ---
// En una implementación real, necesitarías un algoritmo que posicione las palabras
// que se cruzan y determine el tamaño y las celdas negras.
// Esta función es solo un placeholder para mostrar algo.
const generarCuadriculaPlaceholder = (entradas) => {
    const tamano = Math.max(10, ...entradas.map(e => e.palabra.length)) + 2;
    const grid = Array.from({ length: tamano }, () => Array(tamano).fill(null)); 
    let filaActual = 1;
    entradas.forEach((entrada, index) => {
        if (filaActual < tamano -1 && entrada.palabra.length < tamano - 2) {
             grid[filaActual][0] = index + 1; 
            for(let i = 0; i < entrada.palabra.length; i++) {
                grid[filaActual][i + 1] = { letra: '', correcta: entrada.palabra[i] }; 
            }
            filaActual += 2; 
        }
    });
    return grid;
};


// --- COMPONENTE MODIFICADO ---
// Recibe las props del nuevo anfitrión:
const CrucigramaPlayer = ({ pregunta, respuestaActual, onRespuestaChange }) => {
    // 'pregunta.datos_extra' contiene el JSON de 'entradas'
    const { datos_extra, pregunta: texto_pregunta } = pregunta; 
    const { entradas = [] } = datos_extra || {};

    const [cuadricula, setCuadricula] = useState([]);
    // El estado local se inicializa con la respuesta guardada que viene del anfitrión
    const [respuestasUsuario, setRespuestasUsuario] = useState(respuestaActual?.grid || {});

     // Generar cuadrícula y cargar respuestas
    useEffect(() => {
        const gridGenerada = generarCuadriculaPlaceholder(entradas);
        setCuadricula(gridGenerada);

        if (respuestaActual?.grid) {
             setRespuestasUsuario(respuestaActual.grid);
        } else {
             // Inicializar si no hay nada guardado
             const initialRespuestas = {};
             gridGenerada.forEach((filaArr, fila) => {
                 filaArr.forEach((celda, col) => {
                     if (celda && typeof celda === 'object') { 
                         initialRespuestas[`${fila}-${col}`] = ''; 
                     }
                 });
             });
             setRespuestasUsuario(initialRespuestas);
        }
    }, [entradas, respuestaActual]); // Depende de las entradas y la respuesta guardada

    // Manejar cambio en un input de la cuadrícula
    const handleInputChange = (fila, col, valor) => {
        const nuevaLetra = valor.toUpperCase().slice(-1); 
        const key = `${fila}-${col}`;
        const nuevasRespuestas = { ...respuestasUsuario, [key]: nuevaLetra };
        setRespuestasUsuario(nuevasRespuestas); // Actualizar estado local

        // --- LLAMAR AL ANFITRIÓN PARA GUARDAR ---
        // El anfitrión (ExamenAlumno.jsx) se encargará del debounce y de guardarlo
        // en la tabla 'respuestas_alumno'.
        onRespuestaChange(pregunta.id, { grid: nuevasRespuestas });
         
         // Mover foco
         if (nuevaLetra && col + 1 < cuadricula[fila].length && cuadricula[fila][col + 1]) {
             const nextInput = document.getElementById(`cell-${fila}-${col + 1}`);
             nextInput?.focus();
         }
    };


    // Separar pistas
    const pistasHorizontales = entradas.map((e, i) => ({ num: i + 1, pista: e.pista, palabra: e.palabra })); // Simplificado
    const pistasVerticales = []; 

    return (
        <div className="crucigrama-player">
            <p className="instrucciones-pregunta">{texto_pregunta}</p> {/* Usar el texto de la pregunta */}
            <div className="crucigrama-area">
                <div className="crucigrama-cuadricula" style={{ gridTemplateColumns: `repeat(${cuadricula[0]?.length || 1}, 1fr)` }}>
                    {/* ... (El JSX de la cuadrícula no cambia) ... */}
                    {cuadricula.map((filaArr, filaIndex) =>
                        filaArr.map((celda, colIndex) => {
                            if (celda === null) {
                                return <div key={`${filaIndex}-${colIndex}`} className="crucigrama-celda negra"></div>;
                            } else if (typeof celda === 'number') {
                                return <div key={`${filaIndex}-${colIndex}`} className="crucigrama-celda numero">{celda}</div>;
                            } else {
                                const key = `${filaIndex}-${colIndex}`;
                                return (
                                    <div key={key} className="crucigrama-celda letra">
                                        <input
                                            id={`cell-${key}`}
                                            type="text"
                                            maxLength="1"
                                            value={respuestasUsuario[key] || ''}
                                            onChange={(e) => handleInputChange(filaIndex, colIndex, e.target.value)}
                                        />
                                    </div>
                                );
                            }
                        })
                    )}
                </div>
                <div className="crucigrama-pistas">
                    {/* ... (El JSX de las pistas no cambia) ... */}
                    <div className="pistas-columna">
                        <h4>Horizontales</h4>
                        <ol>
                            {pistasHorizontales.map(p => <li key={`h-${p.num}`}><span>{p.num}.</span> {p.pista}</li>)}
                        </ol>
                    </div>
                    {pistasVerticales.length > 0 && (
                        <div className="pistas-columna">
                            <h4>Verticales</h4>
                            <ol>
                                {pistasVerticales.map(p => <li key={`v-${p.num}`}><span>{p.num}.</span> {p.pista}</li>)}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrucigramaPlayer;