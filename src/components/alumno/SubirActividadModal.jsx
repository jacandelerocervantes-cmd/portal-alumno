// src/components/alumno/SubirActividadModal.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNotification } from '../../context/NotificationContext';
import { FaSpinner, FaUpload, FaFile } from 'react-icons/fa';
import './SubirActividadModal.css';

// Función para convertir archivo a Base64
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const SubirActividadModal = ({ actividad, onClose, onEntregaCompleta }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { showNotification } = useNotification();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validar tamaño (ej. 10MB máximo)
            if (selectedFile.size > 10 * 1024 * 1024) {
                showNotification("El archivo es muy grande (máx 10MB).", 'error');
                setFile(null);
                e.target.value = null; // Limpiar input
            } else {
                setFile(selectedFile);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            showNotification("Por favor, selecciona un archivo.", 'warning');
            return;
        }

        setUploading(true);
        showNotification("Subiendo tu entrega...", 'info');

        try {
            // 1. Obtener el token de sesión para autenticar la Edge Function
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session) throw new Error("Sesión no encontrada. Vuelve a iniciar sesión.");

            // 2. Convertir archivo a Base64
            const base64Data = await toBase64(file);

            // 3. Llamar a la Edge Function 'entregar-actividad'
            const { data, error: invokeError } = await supabase.functions.invoke(
                'entregar-actividad', // (Esta función está en el backend 'asistente-vfinal')
                {
                    body: {
                        actividad_id: actividad.id,
                        fileName: file.name,
                        mimeType: file.type,
                        base64Data: base64Data
                    }
                    // No es necesario enviar el header 'Authorization' manualmente,
                    // el cliente de Supabase lo hace automáticamente si hay una sesión activa.
                }
            );

            if (invokeError) throw invokeError;
            
            showNotification(data.message || '¡Entrega realizada con éxito!', 'success');
            onEntregaCompleta(); // Llama a la función para recargar la lista de actividades

        } catch (error) {
            console.error("Error al subir:", error);
            const errorMessage = error.context?.details || error.message || "Error desconocido al subir el archivo.";
            showNotification(errorMessage, 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Entregar Actividad</h3>
                    <button onClick={onClose} className="close-btn" disabled={uploading}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>Vas a entregar la actividad: <strong>{actividad.nombre}</strong></p>
                    <p className="fecha-limite">Fecha Límite: {new Date(actividad.fecha_limite).toLocaleDateString()}</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="file-upload">Selecciona tu archivo (PDF, Word, ZIP, etc.)</label>
                            <input 
                                id="file-upload"
                                type="file" 
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            {file && <p className="file-info"><FaFile /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
                        </div>
                        
                        <button type="submit" className="btn-primary icon-button" disabled={!file || uploading}>
                            {uploading ? <FaSpinner className="spinner" /> : <FaUpload />}
                            {uploading ? 'Subiendo...' : 'Confirmar Entrega'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubirActividadModal;