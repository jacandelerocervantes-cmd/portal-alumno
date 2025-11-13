import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { NotificationProvider } from './context/NotificationContext' // <-- 1. Importar
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider> {/* <-- 2. Envolver la App */}
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>,
)