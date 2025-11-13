import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaEdit, FaCheckCircle, FaRedo } from 'react-icons/fa';
import './AlumnoEvaluacionCard.css';

const AlumnoEvaluacionCard = ({ evaluacion, intento }) => {
    const navigate = useNavigate();
    // --- 1. Obtener 'esta_activo' ---
    const { id, titulo, unidad, tipo_evaluacion, intentos_permitidos, esta_activo } = evaluacion;

    const formatTipo = (tipo) => {
        return tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getStatusAndAction = () => {
        if (intento) {
            if (intento.estado === 'finalizado') {
                return {
                    statusText: 'Completado',
                    statusClass: 'status-completado',
                    actionText: 'Ver Revisión',
                    actionIcon: <FaCheckCircle />,
                    actionClass: 'btn-secondary',
                    disabled: false, // Se puede ver la revisión
                    calificacion: intento.calificacion_final
                };
            }
            // Podría haber otros estados como 'en_progreso'
        }

        // Si no hay intento o no está finalizado
        return {
            statusText: 'Pendiente',
            statusClass: 'status-pendiente',
            actionText: 'Iniciar Evaluación',
            actionIcon: <FaEdit />,
            actionClass: 'btn-primary',
            disabled: false,
            calificacion: null
        };
    };

    const { statusText, statusClass, actionText, actionIcon, actionClass, disabled, calificacion } = getStatusAndAction();

    // --- 2. Lógica de deshabilitado ---
    // El botón se deshabilita si ya lo entregó (disabled) O SI NO ESTÁ ACTIVO
    const estaDeshabilitado = disabled || !esta_activo;

    const handleActionClick = () => {
        if (estaDeshabilitado) return;

        if (intento?.estado === 'finalizado') {
            navigate(`/examen/${id}/revision`);
        } else {
            navigate(`/examen/${id}`);
        }
    };

    return (
        <div className={`alumno-evaluacion-card card ${!esta_activo ? 'desactivado' : ''}`}>
            <div className="eval-card-icon">
                <FaFileAlt />
            </div>
            <div className="eval-card-info">
                <span className="unidad-tag">Unidad {unidad}</span>
                <h3>{titulo}</h3>
                <p>Tipo: <strong>{formatTipo(tipo_evaluacion)}</strong></p>
                {/* 3. Mostrar "No Activo" */}
                {!esta_activo ? (
                    <div className="status-badge status-pendiente">No Activo</div>
                ) : (
                    <div className={`status-badge ${statusClass}`}>
                        {statusText}
                    </div>
                )}
            </div>
            <div className="eval-card-action">
                {calificacion !== null && (
                    <div className="calificacion-badge">
                        Calificación: <strong>{calificacion} / 100</strong>
                    </div>
                )}
                <button 
                    className={`btn ${actionClass} icon-button`}
                    onClick={handleActionClick}
                    disabled={estaDeshabilitado} // <-- ¡CAMBIO AQUÍ!
                    title={!esta_activo ? "Esta evaluación no está activa." : actionText}
                >
                    {actionIcon}
                    {actionText}
                </button>
            </div>
        </div>
    );
};

export default AlumnoEvaluacionCard;