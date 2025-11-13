// src/components/alumno/AlumnoEvaluacionCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlayCircle, FaCheckCircle, FaRedo, FaFileAlt } from 'react-icons/fa';
import './AlumnoEvaluacionCard.css'; // Crearemos este CSS

// Helper para formatear el tipo de examen
const formatTipo = (tipo) => {
    switch (tipo) {
        case 'opcion_multiple': return 'Opción Múltiple';
        case 'abierta': return 'Preguntas Abiertas';
        case 'crucigrama': return 'Crucigrama';
        case 'sopa_letras': return 'Sopa de Letras';
        case 'relacionar_columnas': return 'Relacionar Columnas';
        default: return tipo;
    }
};

const AlumnoEvaluacionCard = ({ evaluacion, intento }) => {
    const navigate = useNavigate();
    const { id, titulo, unidad, tipo_evaluacion, intentos_permitidos } = evaluacion;

    // Determinar el estado del examen y el botón
    const getStatusAndAction = () => {
        if (!intento) {
            // El alumno nunca ha intentado este examen
            return {
                statusText: 'Pendiente',
                statusClass: 'status-pendiente',
                actionText: 'Iniciar Examen',
                actionIcon: <FaPlayCircle />,
                actionClass: 'btn-primary',
                disabled: false,
                calificacion: null
            };
        }

        if (intento.estado === 'calificado') {
            // El examen está terminado y calificado
            return {
                statusText: 'Calificado',
                statusClass: 'status-calificado',
                actionText: 'Revisar Examen',
                actionIcon: <FaCheckCircle />,
                actionClass: 'btn-success',
                disabled: false, // Habilitado para revisar
                calificacion: intento.calificacion_final
            };
        }

        if (intento.estado === 'en_progreso') {
            // El alumno dejó un examen a medias
            return {
                statusText: 'En Progreso',
                statusClass: 'status-entregado', // Reutilizamos clase
                actionText: 'Continuar Examen',
                actionIcon: <FaPlayCircle />,
                actionClass: 'btn-warning', // Botón naranja
                disabled: false,
                calificacion: null
            };
        }

        if (intento.estado === 'entregado') {
             // Entregado pero aún no calificado (ej. preguntas abiertas)
             return {
                statusText: 'Pendiente de Calificar',
                statusClass: 'status-entregado',
                actionText: 'Entregado',
                actionIcon: <FaCheckCircle />,
                actionClass: 'btn-secondary',
                disabled: true,
                calificacion: null
            };
        }

        // Caso por defecto (debería ser 'pendiente', pero es un fallback)
        return {
            statusText: 'Pendiente',
            statusClass: 'status-pendiente',
            actionText: 'Iniciar Examen',
            actionIcon: <FaPlayCircle />,
            actionClass: 'btn-primary',
            disabled: false,
            calificacion: null
        };
    };

    const { statusText, statusClass, actionText, actionIcon, actionClass, disabled, calificacion } = getStatusAndAction();

    const handleActionClick = () => {
        if (statusText === 'Calificado') {
            // Navegar a la página de revisión
            // navigate(`/examen/${id}/revision/${intento.id}`); // (Ruta pendiente de crear)
            alert("Navegando a revisión... (Página pendiente)");
        } else {
            // Navegar a la página de presentar el examen
            navigate(`/examen/${id}`);
        }
    };

    return (
        <div className="alumno-evaluacion-card card">
            <div className="eval-card-icon">
                <FaFileAlt />
            </div>
            <div className="eval-card-info">
                <span className="unidad-tag">Unidad {unidad}</span>
                <h3>{titulo}</h3>
                <p>Tipo: <strong>{formatTipo(tipo_evaluacion)}</strong></p>
                <div className={`status-badge ${statusClass}`}>
                    {statusText}
                </div>
            </div>
            <div className="eval-card-action">
                {calificacion !== null && (
                    <div className="calificacion-badge">
                        Calificación: <strong>{calificacion.toFixed(0)} / 100</strong>
                    </div>
                )}
                <button 
                    className={`btn ${actionClass} icon-button`}
                    onClick={handleActionClick}
                    disabled={disabled}
                >
                    {actionIcon}
                    {actionText}
                </button>
            </div>
        </div>
    );
};

export default AlumnoEvaluacionCard;