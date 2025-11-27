import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const Profile = ({ setAuth }) => {
  const [user, setUser] = useState({ name: "", email: "", joined: "" });

  const getProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: { token: localStorage.token }
      });
      const parseData = await res.json();
      setUser(parseData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg text-white" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <div className="card-body p-5 text-center">
              
              {/* Avatar Circle */}
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: "100px", height: "100px", background: "#6c5ce7", fontSize: "2.5rem", fontWeight: "bold" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <h2 className="mb-1">{user.name}</h2>
              <p className="text-white-50 mb-4">{user.email}</p>

              <hr className="border-secondary" />

              <div className="d-grid gap-2">
                <Link to="/dashboard" className="btn btn-outline-light">
                  <i className="bi bi-columns-gap me-2"></i> Back to Dashboard
                </Link>
                <button onClick={logout} className="btn btn-danger">
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;