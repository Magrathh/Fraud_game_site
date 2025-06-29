// src/components/modals/JoinRoomModal.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../services/socketService';
import '../../assets/css/Modal.css';

const JoinRoomModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState('choice');
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleJoinSuccess = ({ roomId }) => {
      onClose();
      navigate(`/lobby/${roomId}`);
    };
    const handleJoinError = (message) => {
      alert(message);
    };
    socket.on('joinSuccess', handleJoinSuccess);
    socket.on('joinError', handleJoinError);

    return () => {
      socket.off('joinSuccess', handleJoinSuccess);
      socket.off('joinError', handleJoinError);
    };
  }, [navigate, onClose]);

  if (!isOpen) {
    return null;
  }

  // --- ДОБАВЛЕНЫ ЛОГИ ДЛЯ ОТЛАДКИ ---
  const handlePublicJoin = () => {
    console.log('[КЛИК] Нажата кнопка "Публичная комната"');
    socket.emit('joinPublicRoom');
  };

  const handleSetViewToPrivate = () => {
    console.log('[КЛИК] Нажата кнопка "Приватная комната"');
    setView('privateForm');
  };

  const handlePrivateSubmit = (e) => {
    e.preventDefault();
    console.log('[КЛИК] Нажата кнопка "Войти" в приватной форме');
    socket.emit('joinPrivateRoom', { roomName, password });
  };
  
  const handleClose = () => {
    console.error('[КЛИК] Сработала функция handleClose (закрытие окна)');
    setView('choice');
    setRoomName('');
    setPassword('');
    onClose();
  };
  
  const handleStopPropagation = (e) => {
    console.log('%c[КЛИК] Сработала функция stopPropagation на modal-content', 'color: green;');
    e.stopPropagation();
  };
  // --- КОНЕЦ БЛОКА С ЛОГАМИ ---

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={handleStopPropagation}>
        <div className="modal-header">
          <h2>Войти в комнату</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        {view === 'choice' && (
          <div className="modal-body choice-view">
            <button className="choice-button" onClick={handlePublicJoin}>
              Публичная комната
            </button>
            <button className="choice-button" onClick={handleSetViewToPrivate}>
              Приватная комната
            </button>
          </div>
        )}

        {view === 'privateForm' && (
          <form className="modal-body" onSubmit={handlePrivateSubmit}>
            <div className="form-group">
              <label htmlFor="joinRoomName">Название комнаты</label>
              <input type="text" id="joinRoomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="joinPassword">Пароль</label>
              <input type="password" id="joinPassword" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="modal-footer">
              <button type="submit" className="create-room-btn">Войти</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinRoomModal;