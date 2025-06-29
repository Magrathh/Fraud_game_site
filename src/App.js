// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RulesPage from './pages/RulesPage';
import AboutPage from './pages/AboutPage'; // Не забыть создать этот компонент
import SettingsPage from './pages/SettingsPage'; // и этот
import LobbyPage from './pages/LobbyPage'; // и этот
import GamePage from './pages/GamePage'; // и этот

// Добавляем общий фон для всех страниц, кроме главной
import './assets/css/Global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/lobby/:roomId" element={<LobbyPage />} />
        <Route path="/game/:roomId" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default App;