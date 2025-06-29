// src/services/socketService.js
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:4000'; // Адрес нашего сервера

// Создаем и экспортируем экземпляр сокета
export const socket = io(SERVER_URL);