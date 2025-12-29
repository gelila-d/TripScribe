import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {}
          <Route path="/" element={<Navigate to="/login" />} />
           <Route path="/dashboard" element={<Home />} />
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </div>
  )
}
const Root = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return isAuthenticated ? <Navigate to="/dashboard" />: <Navigate to="/login" />;}
export default App;