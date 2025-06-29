// src/pages/HomePage.js

import React, { useState } from 'react';
import '../assets/css/HomePage.css';
import Navbar from '../components/common/Navbar';
import CreateRoomModal from '../components/modals/CreateRoomModal';
import JoinRoomModal from '../components/modals/JoinRoomModal';

const HomePage = () => {
  // Состояние для модального окна СОЗДАНИЯ комнаты
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  // Состояние для модального окна ВХОДА в комнату
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  
  // Для тестов пока будем считать, что пользователь всегда авторизован,
  // чтобы кнопка "Создать комнату" была активна.
  const isAuthenticated = true; 

  const handleCreateRoomClick = () => {
    if (isAuthenticated) {
      setCreateModalOpen(true);
    } else {
      alert("Вам необходимо войти в систему");
    }
  };

  const handleJoinRoomClick = () => {
    // Вход в комнату доступен всем пользователям, даже неавторизованным
    setJoinModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="homepage-container">
        <div className="homepage-content">
          <h1 className="main-title">FRAUD</h1>
          <p className="subtitle">Все хотят выжить, но выживут немногие.</p>
          <div className="door-buttons">
            <button className="door-button left-door" onClick={handleCreateRoomClick}>
              Создать комнату
            </button>
            <button className="door-button right-door" onClick={handleJoinRoomClick}>
              Войти в комнату
            </button>
          </div>
        </div>
      </div>
      
      {/* Модальное окно для СОЗДАНИЯ комнаты */}
      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />

      {/* Модальное окно для ВХОДА в комнату */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </>
  );
};

export default HomePage;