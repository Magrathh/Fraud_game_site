// src/components/common/Navbar.js
import React from 'react';
import '../../assets/css/Navbar.css';
// import logo from '../../assets/images/logo.png'; // Логотип

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {/* <img src={logo} alt="Логотип" /> */}
        <span>FRAUD</span>
      </div>
      <ul className="navbar-links">
        <li><a href="/">Главная</a></li>
        <li><a href="/rules">Правила</a></li>
        <li><a href="/about">О сайте</a></li>
        <li><a href="/settings">Настройки</a></li>
      </ul>
      <div className="navbar-auth">
        <button className="auth-button login">Войти</button>
        <button className="auth-button register">Регистрация</button>
      </div>
    </nav>
  );
};

export default Navbar;