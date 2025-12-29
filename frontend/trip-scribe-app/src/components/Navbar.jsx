import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import ProfileInfo from './Cards/ProfileInfo';
const Navbar = ({ userInfo }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <h2 className="text-2xl font-bold text-purple-600 tracking-tight py-2">
        Trip <span className="text-purple-400">Scribe</span>
      </h2>

      {userInfo && <ProfileInfo userInfo={userInfo} onLogout={onLogout} />}
    </div>
  );
};

export default Navbar;