import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PreferencesProvider } from './context/PreferencesContext'
import { UIProvider } from './context/UIContext'
import './lib/pointer'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PreferencesProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </PreferencesProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
