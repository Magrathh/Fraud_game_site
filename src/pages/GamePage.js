// src/pages/GamePage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../services/socketService';
import Navbar from '../components/common/Navbar';
import '../assets/css/GamePage.css';

const GamePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    // Подписываемся на события
    const onUpdateRoom = (roomData) => setRoom(roomData);
    const onRoomDeleted = () => {
      alert('Владелец покинул комнату. Игра окончена.');
      navigate('/');
    };
    
    socket.on('updateRoom', onUpdateRoom);
    socket.on('roomDeleted', onRoomDeleted);

    // При входе на страницу запрашиваем актуальное состояние комнаты
    // Это важно, если пользователь случайно перезагрузит страницу во время игры
    socket.emit('getRoomData', { roomId });

    return () => {
      // Отписываемся от событий при выходе со страницы
      socket.off('updateRoom', onUpdateRoom);
      socket.off('roomDeleted', onRoomDeleted);
    };
  }, [roomId, navigate]);

  if (!room) {
    return <div>Загрузка игры...</div>;
  }
  
  // Просто для примера, пока не реализуем полную логику карточек
  const players = room.players || [];

  return (
    <>
      <Navbar />
      <div className="game-container">
        <h1 className="game-header">Идет игра</h1>
        
        {/* Класс сетки можно будет менять динамически в зависимости от числа игроков */}
        <div className={`game-grid grid-${players.length}`}>
          {players.map(player => (
            <div key={player.id} className="game-player-card">
              <div className="player-video">
                {/* Здесь будет <video> или <img> */}
              </div>
              <div className="player-info">
                <h3>{player.username}</h3>
                <p>{room.ownerId === player.id ? 'Владелец' : 'Игрок'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GamePage;