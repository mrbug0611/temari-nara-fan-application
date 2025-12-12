// src/App.jsx


import { useState, useEffect } from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { ThemeProvider } from './contexts/ThemeContext';



import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// layout components
import Navigation from './components/layout/Navigation';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
