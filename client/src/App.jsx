import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Credits from './pages/Credits';
import ChatBox from './components/Chatbox';
import Community from './pages/Community';
import { assets } from './assets/assets';
import './assets/prism.css';
import Login from './pages/Login';
import { useAppContext } from './context/AppContext';
import Loading from './pages/Loading';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const { user, loadingUser } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const { pathname } = useLocation();

  if (pathname === '/loading' || loadingUser) return <Loading />;

  return (
    <>
      <Toaster />
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          className={`absolute w-8 h-8 top-3 left-3 cursor-pointer md:hidden not-dark:invert ${
            isMenuOpen ? 'hidden' : 'block'
          }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          alt=""
        />
      )}

      {user ? (
        <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">
          <div className="flex h-screen w-screen">
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path="/" element={<ChatBox />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen">
          <Login />
        </div>
      )}
    </>
  );
};

export default App;
