// src/components/AlumnoMateriaCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen } from 'react-icons/fa';
import './AlumnoMateriaCard.css'; // Crearemos este CSS

const AlumnoMateriaCard = ({ materia }) => {
  if (!materia) return null;

  return (
    <Link to={`/materia/${materia.id}`} className="materia-card-link">
      <div className="alumno-materia-card">
        <div className="card-icon">
          <FaBookOpen />
        </div>
        <div className="card-info">
          <h3>{materia.nombre}</h3>
          <p>{materia.semestre}</p>
        </div>
        <span className="card-cta">
          Acceder al Portal
        </span>
      </div>
    </Link>
  );
};

export default AlumnoMateriaCard;