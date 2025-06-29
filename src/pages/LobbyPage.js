import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../services/socketService';
import Navbar from '../components/common/Navbar';
import '../assets/css/LobbyPage.css';

const LobbyPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [room, setRoom] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const isCreator = location.state?.isCreator;

  useEffect(() => {
    // --- Настройка слушателей событий от сервера ---
    const onUpdateRoom = (roomData) => setRoom(roomData);
    const onRoomDeleted = () => {
      alert('Владелец покинул комнату или отключился. Комната была удалена.');
      navigate('/');
    };
    const onError = (errorMessage) => {
      alert(errorMessage);
      navigate('/');
    };
    const onTimerUpdate = (value) => setCountdown(value);
    const onGameStarting = () => {
      alert('Игра начинается! Переход в игровую комнату...');
      navigate(`/game/${roomId}`);
    };

    socket.on('updateRoom', onUpdateRoom);
    socket.on('roomDeleted', onRoomDeleted);
    socket.on('error', onError);
    socket.on('timerUpdate', onTimerUpdate);
    socket.on('gameStarting', onGameStarting);

    // --- Логика входа в комнату ---
    // Если мы создатель, мы уже "в комнате", просто запрашиваем ее состояние.
    if (isCreator) {
      socket.emit('getInitialRoomData', { roomId });
    } else {
      // Если мы обычный игрок, мы должны присоединиться.
      socket.emit('joinRoom', { roomId });
    }

    // --- Функция очистки при выходе со страницы ---
    return () => {
      // Всегда отписываемся от слушателей, чтобы избежать утечек памяти
      socket.off('updateRoom', onUpdateRoom);
      socket.off('roomDeleted', onRoomDeleted);
      socket.off('error', onError);
      socket.off('timerUpdate', onTimerUpdate);
      socket.off('gameStarting', onGameStarting);
    };
  }, [roomId, navigate, isCreator]);

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', { roomId });
    navigate('/');
  };
  
  if (!room) {
    return <div>Загрузка комнаты...</div>;
  }

  const playerSlots = new Array(16).fill(null);
  if (room.players) {
    room.players.forEach((player, index) => {
      if (index < 16) { playerSlots[index] = player; }
    });
  }

  return (
    <>
      <Navbar />
      <div className="lobby-container">
        <div className="lobby-header">
          <h1>Ожидание игроков</h1>
          <p>Комната: {room.name}</p>
          {room.password && <div className="password-display">Пароль: <strong>{room.password}</strong></div>}
        </div>
        <div className="players-grid">
          {playerSlots.map((player, index) => (
            <div key={index} className={`player-slot ${player ? 'occupied' : ''}`}>
              {player ? (
                <>
                  <div className="player-avatar"></div>
                  <div className="player-name">{player.username}</div>
                  {room.ownerId === player.id && <span>(👑)</span>}
                </>
              ) : (<span>Свободно</span>)}
            </div>
          ))}
        </div>
        <div className="lobby-footer">
          <button className="leave-button" onClick={handleLeaveRoom}>Покинуть комнату</button>
          <div className="footer-info">
            {countdown !== null && (
                <div className="countdown-timer">
                    Старт через: {countdown}с
                </div>
            )}
            <div className="player-count">
                Игроки: {room.players.length} / 16
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LobbyPage;