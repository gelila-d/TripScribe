import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react'

import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
