import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileInfo from './Cards/ProfileInfo';
import SearchBar from './Input/SearchBar';

const Navbar = ({ userInfo, searchQuery, setSearchQuery, onSearchNote, handleClearSearch }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery('');
    handleClearSearch();
  };

  return (
    <div className="bg-white flex flex-col md:flex-row items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10 transition-all">
      <h2 className="text-2xl font-bold text-purple-600 tracking-tight py-2">
        Trip <span className="text-purple-400">Scribe</span>
      </h2>

      {userInfo && (
        <div className="flex-1 flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0">
          <SearchBar
            value={searchQuery}
            onChange={({ target }) => setSearchQuery(target.value)}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />

          <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
        </div>
      )}
    </div>
  );
};

export default Navbar;