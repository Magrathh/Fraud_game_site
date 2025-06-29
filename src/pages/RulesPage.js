// src/pages/RulesPage.js
import React from 'react';
import Navbar from '../components/common/Navbar';

const RulesPage = () => {
  return (
    <>
      <Navbar />
      <div style={{color: 'white', paddingTop: '100px', textAlign: 'center'}}>
        <h1>Правила Игры</h1>
        <p>Здесь будут правила игры "Бункер".</p>
      </div>
    </>
  );
};

export default RulesPage;