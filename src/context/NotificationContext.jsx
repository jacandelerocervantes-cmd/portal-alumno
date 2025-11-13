// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Notification.css';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeNotification(id);
        }, 5000); // Desaparece después de 5 segundos
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification: addNotification }}>
            {children}
            <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
        </NotificationContext.Provider>
    );
};

const NotificationContainer = ({ notifications, removeNotification }) => (
    <div className="notification-container">
        {notifications.map(n => (
            <Notification key={n.id} {...n} onClose={() => removeNotification(n.id)} />
        ))}
    </div>
);

const Notification = ({ message, type, onClose }) => {
    const icons = {
        success: <FaCheckCircle />,
        error: <FaExclamationTriangle />,
        info: <FaInfoCircle />,
        warning: <FaExclamationTriangle />,
    };

    return (
        <div className={`notification ${type}`}>
            <span className="notification-icon">{icons[type]}</span>
            <p>{message}</p>
            <button onClick={onClose} className="notification-close-btn"><FaTimes /></button>
        </div>
    );
};