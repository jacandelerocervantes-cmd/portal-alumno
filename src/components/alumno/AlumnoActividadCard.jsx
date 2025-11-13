// src/components/alumno/AlumnoActividadCard.jsx
import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaClock, FaFileUpload, FaFileDownload } from 'react-icons/fa';
import './AlumnoActividadCard.css'; // Crearemos este CSS

// Helper para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return dateString; // Devolver el string original si falla
    }
};

// --- 1. Añadir 'onEntregarClick' como prop ---
const AlumnoActividadCard = ({ actividad, calificacion, onEntregarClick }) => {
    // --- 1. Obtener 'esta_activo' de la actividad ---
    const { nombre, descripcion, unidad, tipo_entrega, fecha_limite, esta_activo } = actividad;

    // Determinar el estado de la entrega
    const getStatus = () => {
        if (calificacion?.estado === 'calificado') {
            return {
                icon: <FaCheckCircle className="icon-success" />,
                text: 'Calificado',
                clase: 'status-calificado'
            };
        }
        if (calificacion?.estado === 'entregado') {
            return {
                icon: <FaClock className="icon-pending" />,
                text: 'Entregado (Pendiente)',
                clase: 'status-entregado'
            };
        }
        // Comprobar si la fecha límite ya pasó
        const hoy = new Date();
        const limite = new Date(fecha_limite);
        if (limite < hoy) {
            return {
                icon: <FaTimesCircle className="icon-danger" />,
                text: 'Vencido',
                clase: 'status-vencido'
            };
        }
        // Si no está entregado y no ha vencido
        return {
            icon: <FaExclamationCircle className="icon-warning" />,
            text: 'Pendiente',
            clase: 'status-pendiente'
        };
    };

    const status = getStatus();

    // Comprobar si la fecha límite ya pasó
    const vencido = new Date(fecha_limite) < new Date();

    // --- 2. Lógica de deshabilitado ---
    // El botón se deshabilita si está vencido O SI NO ESTÁ ACTIVO
    const estaDeshabilitado = vencido || !esta_activo;

    return (
        <div className={`alumno-actividad-card card ${!esta_activo ? 'desactivado' : ''}`}>
            <div className="card-header">
                <span className="unidad-tag">Unidad {unidad}</span>
                {/* 3. Mostrar un badge si no está activo */}
                {!esta_activo ? (
                    <div className="status-badge status-pendiente">No Activo</div>
                ) : (
                    <div className={`status-badge ${status.clase}`}>
                        {status.icon}
                        {status.text}
                    </div>
                )}
            </div>
            
            <div className="card-body">
                <h3>{nombre}</h3>
                <p className="descripcion">{descripcion || 'Sin descripción.'}</p>
            </div>
            
            <div className="card-footer">
                <div className="footer-info">
                    <strong>Fecha Límite:</strong>
                    <span>{formatDate(fecha_limite)}</span>
                </div>
                <div className="footer-info">
                    <strong>Tipo:</strong>
                    <span>{tipo_entrega}</span>
                </div>
            </div>

            {/* --- 2. Lógica de Acciones Modificada --- */}
            <div className="card-actions">
                {/* Si ya está calificado, mostrar nota y enlace de descarga */}
                {calificacion?.estado === 'calificado' && (
                    <>
                        <a href={calificacion.drive_url_entrega} target="_blank" rel="noopener noreferrer" className="btn-secondary icon-button btn-small">
                            <FaFileDownload /> Ver mi entrega
                        </a>
                        <div className="calificacion-badge">
                            Calificación: <strong>{calificacion.calificacion_obtenida} / 100</strong>
                        </div>
                    </>
                )}

                {/* Si solo está entregado (no calificado) */}
                {calificacion?.estado === 'entregado' && (
                    <>
                        <a href={calificacion.drive_url_entrega} target="_blank" rel="noopener noreferrer" className="btn-secondary icon-button btn-small">
                            <FaFileDownload /> Ver mi entrega
                        </a>
                        <button 
                            className="btn-primary icon-button" 
                            onClick={() => onEntregarClick(actividad)} 
                            disabled={estaDeshabilitado}
                            title={!esta_activo ? "Esta actividad aún no ha sido activada por el docente." : (vencido ? "La fecha límite ha pasado." : "Reemplazar entrega")}
                        >
                            <FaFileUpload /> Reemplazar Entrega
                        </button>
                    </>
                )}

                {/* Si está pendiente */}
                {!calificacion && (
                    <button 
                        className="btn-primary icon-button" 
                        onClick={() => onEntregarClick(actividad)} 
                        disabled={estaDeshabilitado}
                        title={!esta_activo ? "Esta actividad aún no ha sido activada por el docente." : (vencido ? "La fecha límite ha pasado." : "Subir entrega")}
                    >
                        <FaFileUpload /> Subir Archivo
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlumnoActividadCard;