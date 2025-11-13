// src/hooks/useGuardarRespuesta.js
import { useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// Este hook devuelve una función para guardar que espera un poco
// antes de enviar los datos a Supabase, evitando sobrecargar la red.
export const useGuardarRespuesta = (intentoId) => {
    // Usamos useRef para mantener el ID del temporizador entre renders
    const timerRef = useRef(null);

    // useCallback para que esta función no se recree en cada render
    const guardarRespuesta = useCallback((preguntaId, respuestaData, puntos = 0) => {
        
        // Si ya había un guardado programado, lo cancelamos
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Programamos un nuevo guardado para dentro de 1.5 segundos
        timerRef.current = setTimeout(async () => {
            try {
                // RLS: "Alumnos pueden crear sus propias respuestas" nos protege
                const { error } = await supabase
                    .from('respuestas_alumno')
                    .upsert(
                        {
                            intento_id: intentoId,
                            pregunta_id: preguntaId,
                            respuesta_json: respuestaData,
                            puntos_obtenidos: puntos, // Default 0, se recalcula al finalizar
                        },
                        {
                            onConflict: 'intento_id, pregunta_id', // Si ya existe, actualiza
                        }
                    );

                if (error) throw error;
                console.log(`Respuesta guardada para P:${preguntaId}`);

            } catch (err) {
                console.error("Error al guardar respuesta:", err.message);
                // Aquí podríamos notificar al usuario
            }
        }, 1500); // 1.5 segundos de espera
    
    }, [intentoId]);

    return guardarRespuesta;
};