import React, { useState } from 'react';
import Topline from './components/Topline';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Marketplace from './components/Marketplace';
import AgentMode from './components/AgentMode';
import CreatorCTA from './components/CreatorCTA';
import Footer from './components/Footer';
import Toast from './components/Toast';

export default function App() {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  return (
    <div className="app" id="top">
      <Topline />
      <Header onToast={showToast} />
      <main>
        <Hero />
        <Stats />
        <Marketplace onToast={showToast} />
        <AgentMode onToast={showToast} />
        <CreatorCTA onToast={showToast} />
      </main>
      <Footer />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
