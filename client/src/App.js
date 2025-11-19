import React, { Fragment, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Board from './components/Board';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 1. Add a loading state
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function checkAuthenticated() {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      const parseRes = await response.json();

      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (err) {
      console.error(err.message);
    } finally {
      // 2. Whether it worked or failed, we are done loading
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuthenticated();
  }, []);

  // 3. If still loading, don't run the router yet. Just show a spinner/text.
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
            {/* The Board Route */}
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