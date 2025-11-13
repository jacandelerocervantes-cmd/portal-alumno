// src/components/alumno/AlumnoMaterial.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { FaFolder, FaFilePdf, FaFileWord, FaFilePowerpoint, FaFile, FaSpinner, FaFileImage, FaFileArchive, FaFileVideo } from 'react-icons/fa';
import './AlumnoMaterial.css'; // Crearemos este CSS

const AlumnoMaterial = ({ materia }) => {
    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados de Navegación
    const [path, setPath] = useState([]); // [{ id, name }]
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [currentContents, setCurrentContents] = useState({ folders: [], files: [] });

    // 1. Hook Inicial: Establecer la carpeta raíz
    useEffect(() => {
        if (materia?.drive_folder_material_id) {
            const rootId = materia.drive_folder_material_id;
            const rootName = "Material Didáctico";
            setPath([{ id: rootId, name: rootName }]);
            setCurrentFolderId(rootId);
        } else {
            setError("La carpeta de material no está configurada para esta materia.");
            setLoading(false);
        }
    }, [materia]);

    // 2. Hook de Fetching: Cargar contenido cuando cambia la carpeta actual
    const fetchContents = useCallback(async (folderId) => {
        if (!folderId) return;
        setLoading(true);
        setError('');
        try {
            // Esta función es la misma que usa el docente, es segura.
            const { data, error: invokeError } = await supabase.functions.invoke('material-get-contents', {
                body: { folder_id: folderId }
            });
            if (invokeError) throw invokeError;
            
            setCurrentContents({
                folders: data.archivos.folders || [],
                files: data.archivos.files || []
            });
        } catch (error) {
            const errorMessage = error.context?.details || error.message || "Error al cargar el contenido.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentFolderId) {
            fetchContents(currentFolderId);
        }
    }, [currentFolderId, fetchContents]);

    // 3. Handlers de Navegación
    const handleFolderClick = (folder) => {
        setPath(prevPath => [...prevPath, { id: folder.id, name: folder.name }]);
        setCurrentFolderId(folder.id);
    };

    const handleBreadcrumbClick = (index) => {
        const newPath = path.slice(0, index + 1);
        setPath(newPath);
        setCurrentFolderId(newPath[newPath.length - 1].id);
    };

    // 4. Helper para íconos de archivos
    const getFileIcon = (mimeType) => {
        if (!mimeType) return <FaFile />;
        if (mimeType.includes('pdf')) return <FaFilePdf style={{ color: '#D9534F' }} />;
        if (mimeType.includes('word')) return <FaFileWord style={{ color: '#2A5699' }} />;
        if (mimeType.includes('powerpoint')) return <FaFilePowerpoint style={{ color: '#D24726' }} />;
        if (mimeType.startsWith('image/')) return <FaFileImage style={{ color: '#5CB85C' }} />;
        if (mimeType.startsWith('video/')) return <FaFileVideo style={{ color: '#5BC0DE' }} />;
        if (mimeType.includes('zip') || mimeType.includes('archive')) return <FaFileArchive style={{ color: '#F0AD4E' }} />;
        return <FaFile style={{ color: '#777' }} />;
    };

    return (
        <div className="alumno-material-panel">
            {error && <p className="error-message">{error}</p>}
            
            {/* Breadcrumbs */}
            <nav className="material-breadcrumbs">
                {path.map((p, index) => (
                    <React.Fragment key={p.id}>
                        {index > 0 && <span className="breadcrumb-separator">/</span>}
                        <button 
                            className="breadcrumb-item"
                            onClick={() => handleBreadcrumbClick(index)}
                            disabled={index === path.length - 1}
                        >
                            {p.name}
                        </button>
                    </React.Fragment>
                ))}
            </nav>

            {/* Lista de Contenidos */}
            <div className="material-list-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}><FaSpinner className="spinner" /> Cargando...</div>
                ) : (
                    <div className="material-list">
                        {/* Carpetas */}
                        {currentContents.folders.map(folder => (
                            <div key={folder.id} className="material-item folder" onClick={() => handleFolderClick(folder)}>
                                <span className="material-item-icon folder"><FaFolder /></span>
                                <span className="material-item-name">{folder.name}</span>
                            </div>
                        ))}
                        
                        {/* Archivos (los enlaces se abren en pestaña nueva) */}
                        {currentContents.files.map(file => (
                            <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="material-item file">
                                <span className="material-item-icon file">
                                    {file.iconLink ? <img src={file.iconLink} alt="tipo" /> : getFileIcon(file.mimeType)}
                                </span>
                                <span className="material-item-name">{file.name}</span>
                            </a>
                        ))}

                        {!loading && currentContents.folders.length === 0 && currentContents.files.length === 0 && (
                            <p className="material-empty">Esta carpeta está vacía.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlumnoMaterial;