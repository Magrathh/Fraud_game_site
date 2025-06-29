// src/components/modals/CreateRoomModal.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/Modal.css';
import { socket } from '../../services/socketService';

const CreateRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // Состояния для хранения значений полей формы
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [gameStyle, setGameStyle] = useState('realism');

  // Этот хук слушает ответ от сервера о создании комнаты
  useEffect(() => {
    const handleRoomCreated = ({ roomId }) => {
      console.log(`%c[Клиент] Получено 'roomCreated'. ID комнаты: ${roomId}. Начинаю переход...`,
        'color: green; font-weight: bold;');
      // При успешном создании переходим в лобби,
      // передавая флаг, что мы являемся создателем комнаты.
      // Это ключевой момент для исправления бага.
      navigate(`/lobby/${roomId}`, { state: { isCreator: true } });
    };

    socket.on('roomCreated', handleRoomCreated);

    // Важно отписаться от события при размонтировании компонента
    return () => {
      socket.off('roomCreated', handleRoomCreated);
    };
  }, [navigate]);
  
  // Не рендерим окно, если оно не открыто
  if (!isOpen) {
    return null;
  }
  
  const handleCreate = () => {
    if (!roomName.trim()) {
        alert('Пожалуйста, введите название комнаты.');
        return;
    }

    // Формируем объект с настройками для отправки на сервер
    const settings = {
      roomName,
      isPrivate,
      useWebcam,
      language,
      gameStyle,
      // Можно добавить и другие поля, например, имя пользователя
      username: 'Владелец', // Временно, пока нет авторизации
    };
    
    // Отправляем событие 'createRoom' на сервер с настройками
    socket.emit('createRoom', settings);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать комнату</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="language">Язык данных</label>
            <select id="language" name="language" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="roomName">Название комнаты</label>
            <input 
              type="text" 
              id="roomName" 
              name="roomName" 
              placeholder="Название вашей комнаты..." 
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="gameStyle">Стиль игры</label>
            <select id="gameStyle" name="gameStyle" value={gameStyle} onChange={e => setGameStyle(e.target.value)}>
              <option value="realism">Реализм</option>
              <option value="fantasy">Фэнтези</option>
              <option value="cyberpunk">Киберпанк</option>
            </select>
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="useWebcam" 
              name="useWebcam" 
              checked={useWebcam}
              onChange={e => setUseWebcam(e.target.checked)}
            />
            <label htmlFor="useWebcam">Использовать веб-камеры</label>
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox"
id="isPrivate" 
              name="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <label htmlFor="isPrivate">Приватная игра</label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="create-room-btn" onClick={handleCreate}>Создать</button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;