// src/components/alumno/AlumnoActividadCard.jsx
import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaClock, FaFileUpload } from 'react-icons/fa';
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

const AlumnoActividadCard = ({ actividad, calificacion }) => {
    const { nombre, descripcion, unidad, tipo_entrega, fecha_limite } = actividad;

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

    return (
        <div className="alumno-actividad-card card">
            <div className="card-header">
                <span className="unidad-tag">Unidad {unidad}</span>
                <div className={`status-badge ${status.clase}`}>
                    {status.icon}
                    {status.text}
                </div>
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

            <div className="card-actions">
                {/* Mostramos la calificación si existe */}
                {calificacion?.estado === 'calificado' ? (
                    <div className="calificacion-badge">
                        Calificación: <strong>{calificacion.calificacion_obtenida} / 100</strong>
                    </div>
                ) : (
                    // Botón para subir (la lógica de subida la añadiremos después)
                    <button className="btn-primary icon-button" disabled={status.clase === 'status-vencido'}>
                        <FaFileUpload /> {calificacion?.estado === 'entregado' ? 'Reemplazar Entrega' : 'Subir Archivo'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlumnoActividadCard;