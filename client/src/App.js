import React, { Fragment, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Board from './components/Board';
import { API_URL } from "./config"; // <--- 1. NEW IMPORT

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function checkAuthenticated() {
    try {
      // 2. FIXED URL HERE:
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: "GET",
        headers: { token: localStorage.token }
      });

      const parseRes = await response.json();

      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuthenticated();
  }, []);

  if (isLoading) {
    return <div className="container mt-5"><h3>Checking credentials...</h3></div>;
  }

  return (
    <Fragment>
      <Router>
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard setAuth={setAuth} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/board/:id" 
              element={isAuthenticated ? <Board /> : <Navigate to="/login" />} 
            />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </Fragment>
  );
}

export default App;