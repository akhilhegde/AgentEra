import { useState, useEffect } from 'react';
import { reconnectSession } from './services/peraWallet';
import Topline from './components/Topline';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Marketplace from './components/Marketplace';
import AgentMode from './components/AgentMode';
import CreatorCTA from './components/CreatorCTA';
import Footer from './components/Footer';
import Toast from './components/Toast';
import TransactionsPage from './pages/TransactionsPage';
import ResumeReviewPage from './pages/ResumeReviewPage';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    reconnectSession();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  return (
    <div className="app" id="top">
      <Topline />
      <Header onToast={showToast} onViewChange={setCurrentView} currentView={currentView} />
      
      {currentView === 'transactions' ? (
        <TransactionsPage />
      ) : currentView === 'resume-review' ? (
        <ResumeReviewPage onViewChange={setCurrentView} />
      ) : (
        <main>
          <Hero />
          <Stats />
          <Marketplace onToast={showToast} onViewChange={setCurrentView} />
          <AgentMode onToast={showToast} />
          <CreatorCTA onToast={showToast} />
        </main>
      )}

      <Footer />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

