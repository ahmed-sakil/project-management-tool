import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { API_URL } from "./config";

// --- 1. IMPORT TOASTIFY CSS & CONTAINER ---
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Board from "./components/Board";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Landing from "./components/Landing";
import TimeWidget from "./components/TimeWidget";
import Notifications from "./components/Notifications";
// 2. IMPORT PROFILE (This was missing)
import Profile from "./components/Profile";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const location = useLocation();

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: "GET",
        headers: { token: localStorage.token }
      });
      const parseRes = await response.json();
      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (err) {
      console.error(err.message);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); 
    }
  }

  useEffect(() => {
    isAuth();
  }, []);

  // Clock Hiding Logic
  const hideWidgetOnPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const showWidget = !hideWidgetOnPaths.some(path => 
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
  );

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "var(--bg-body-base)" }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100"> 
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="dark" 
      />

      <Navbar isAuthenticated={isAuthenticated} setAuth={setAuth} />

      <div className="flex-grow-1"> 
        <Routes>
          <Route path="/" element={<Landing isAuthenticated={isAuthenticated} />} />
          <Route path="/login" element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/login" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard setAuth={setAuth} /> : <Navigate to="/login" />} />
          <Route path="/board/:id" element={isAuthenticated ? <Board /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
          
          {/* 3. ADDED PROFILE ROUTE */}
          <Route path="/profile" element={isAuthenticated ? <Profile setAuth={setAuth} /> : <Navigate to="/login" />} />
        
        </Routes>
      </div>

      <Footer />
      {showWidget && <TimeWidget />}
    </div>
  );
}

export default App;