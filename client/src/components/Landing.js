import React from "react";
import { Link, Navigate } from "react-router-dom";

const Landing = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="landing-page">
      <div className="text-center py-5 mb-5" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%)" }}>
        <div className="container">
          <h1 className="display-3 fw-bold mb-3 text-white">
            Manage Projects <span style={{ color: "var(--system-green)" }}>Effortlessly</span>
          </h1>
          <p className="lead text-white-50 mb-4 mx-auto" style={{ maxWidth: "600px" }}>
            A powerful, open-source project management tool to organize your tasks, 
            collaborate with teams, and hit your deadlines.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-success btn-lg px-5 shadow-lg">Start Now</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg px-5">Login</Link>
          </div>
        </div>
      </div>

      <div className="container mb-5">
        <div className="row text-center g-4">
          
          <div className="col-md-4">
            <div className="card h-100 p-4">
              <div className="display-4 mb-3" style={{ color: "var(--system-green)" }}>
                <i className="bi bi-clipboard-plus"></i>
              </div>
              <h4 className="text-white">1. Create Boards</h4>
              <p className="text-muted">
                Create distinct boards for different projects (e.g., "Website Redesign", "Marketing").
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 p-4">
              <div className="display-4 mb-3" style={{ color: "var(--system-green)" }}>
                <i className="bi bi-list-check"></i>
              </div>
              <h4 className="text-white">2. Add Lists & Cards</h4>
              <p className="text-muted">
                Break down tasks into Lists (To Do, In Progress) and detailed Cards.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 p-4">
              <div className="display-4 mb-3" style={{ color: "var(--system-green)" }}>
                <i className="bi bi-arrows-move"></i>
              </div>
              <h4 className="text-white">3. Drag & Drop</h4>
              <p className="text-muted">
                Smoothly drag cards between lists to update status in real-time.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Landing;